<?php

/**
 * Export the deliberately small Trayport PoC source graph through WordPress and ACF.
 *
 * Run only from an already bootstrapped WP-CLI process:
 *   TP_POC_ROOT_IDS=1898,2203 wp eval-file /tmp/trayport-export.php
 */

if (!defined('ABSPATH') || !defined('WP_CLI')) {
    fwrite(STDERR, "This exporter must run through WP-CLI.\n");
    exit(2);
}

const TP_SCHEMA_VERSION = 1;

function tp_emit(array $record): void
{
    $record = array_merge(['schemaVersion' => TP_SCHEMA_VERSION], $record);
    $json = wp_json_encode($record, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);

    if ($json === false) {
        throw new RuntimeException('Could not encode export record.');
    }

    fwrite(STDOUT, $json . PHP_EOL);
}

function tp_is_list_array(array $value): bool
{
    if (function_exists('array_is_list')) {
        return array_is_list($value);
    }

    return array_keys($value) === range(0, count($value) - 1);
}

function tp_relative_path_for_post(int $postId): ?string
{
    $url = get_permalink($postId);

    if (!$url || is_wp_error($url)) {
        return null;
    }

    $path = wp_parse_url($url, PHP_URL_PATH);

    if (!is_string($path) || $path === '') {
        return '/';
    }

    return '/' . ltrim($path, '/');
}

function tp_reference_id($value): int
{
    if ($value instanceof WP_Post || $value instanceof WP_Term) {
        return (int) ($value instanceof WP_Post ? $value->ID : $value->term_id);
    }

    if (is_numeric($value)) {
        return (int) $value;
    }

    if (is_array($value)) {
        foreach (['ID', 'id', 'term_id', 'value'] as $key) {
            if (isset($value[$key]) && is_numeric($value[$key])) {
                return (int) $value[$key];
            }
        }
    }

    return 0;
}

function tp_normalize($value, array &$mediaIds, array &$termIds)
{
    if ($value === null || is_bool($value) || is_int($value) || is_float($value) || is_string($value)) {
        return $value;
    }

    if ($value instanceof WP_User) {
        return null;
    }

    if ($value instanceof WP_Post) {
        $postId = (int) $value->ID;
        $postType = (string) get_post_type($postId);

        if ($postType === 'attachment') {
            $mediaIds[$postId] = true;

            return [
                '$ref' => 'media',
                'id' => $postId,
                'title' => get_the_title($postId),
                'url' => wp_get_attachment_url($postId) ?: null,
            ];
        }

        return [
            '$ref' => 'post',
            'id' => $postId,
            'postType' => $postType,
            'title' => get_the_title($postId),
            'path' => tp_relative_path_for_post($postId),
        ];
    }

    if ($value instanceof WP_Term) {
        $termId = (int) $value->term_id;
        $termIds[$value->taxonomy . ':' . $termId] = [
            'id' => $termId,
            'taxonomy' => (string) $value->taxonomy,
        ];

        return [
            '$ref' => 'term',
            'id' => $termId,
            'taxonomy' => (string) $value->taxonomy,
            'title' => (string) $value->name,
        ];
    }

    if (is_array($value)) {
        $possibleMediaId = 0;
        if (
            isset($value['ID'])
            && is_numeric($value['ID'])
            && (
                isset($value['mime_type'])
                || isset($value['sizes'])
                || isset($value['filename'])
                || isset($value['url'])
            )
        ) {
            $possibleMediaId = (int) $value['ID'];
        }

        if ($possibleMediaId > 0 && get_post_type($possibleMediaId) === 'attachment') {
            $mediaIds[$possibleMediaId] = true;

            return [
                '$ref' => 'media',
                'id' => $possibleMediaId,
                'title' => isset($value['title']) ? (string) $value['title'] : get_the_title($possibleMediaId),
                'url' => isset($value['url']) && is_string($value['url'])
                    ? $value['url']
                    : (wp_get_attachment_url($possibleMediaId) ?: null),
            ];
        }

        $normalized = [];

        foreach ($value as $key => $child) {
            if (
                is_string($key)
                && in_array(strtolower($key), ['api_key', 'apikey', 'key', 'password', 'secret', 'token'], true)
            ) {
                continue;
            }
            $normalized[$key] = tp_normalize($child, $mediaIds, $termIds);
        }

        if (!tp_is_list_array($normalized)) {
            ksort($normalized);
        }

        return $normalized;
    }

    if (is_object($value)) {
        return tp_normalize(get_object_vars($value), $mediaIds, $termIds);
    }

    return null;
}

function tp_export_post(
    int $postId,
    array &$mediaIds,
    array &$termIds,
    ?array $acfFields = null,
    bool $includeFeaturedMedia = true,
    string $scopeRole = 'root',
    ?int $featuredOrder = null
): void
{
    $post = get_post($postId);

    if (!$post instanceof WP_Post) {
        throw new RuntimeException("Source post {$postId} does not exist.");
    }

    $taxonomyMap = [];
    foreach (get_object_taxonomies($post->post_type) as $taxonomy) {
        $terms = wp_get_object_terms($postId, $taxonomy);
        if (is_wp_error($terms) || !$terms) {
            continue;
        }

        $ids = [];
        foreach ($terms as $term) {
            $termId = (int) $term->term_id;
            $ids[] = $termId;
            $termIds[$taxonomy . ':' . $termId] = [
                'id' => $termId,
                'taxonomy' => (string) $taxonomy,
            ];
        }
        sort($ids);
        $taxonomyMap[$taxonomy] = $ids;
    }
    ksort($taxonomyMap);

    $featuredMediaId = $includeFeaturedMedia ? (int) get_post_thumbnail_id($postId) : 0;
    if ($featuredMediaId > 0) {
        $mediaIds[$featuredMediaId] = true;
    }

    $allAcf = function_exists('get_fields') ? (get_fields($postId) ?: []) : [];
    $acf = [];
    if ($acfFields === null) {
        $acf = $allAcf;
    } else {
        foreach ($acfFields as $fieldName) {
            if (array_key_exists($fieldName, $allAcf)) {
                $acf[$fieldName] = $allAcf[$fieldName];
            }
        }
    }
    $normalizedAcf = tp_normalize($acf, $mediaIds, $termIds);

    tp_emit([
        'entity' => 'post',
        'legacyId' => $postId,
        'postType' => (string) $post->post_type,
        'status' => (string) $post->post_status,
        'title' => html_entity_decode(get_the_title($postId), ENT_QUOTES | ENT_HTML5, 'UTF-8'),
        'slug' => (string) $post->post_name,
        'path' => tp_relative_path_for_post($postId),
        'parentId' => (int) $post->post_parent,
        'menuOrder' => (int) $post->menu_order,
        'excerpt' => (string) $post->post_excerpt,
        'content' => (string) $post->post_content,
        'publishedAt' => $post->post_date_gmt !== '0000-00-00 00:00:00'
            ? mysql2date(DATE_ATOM, $post->post_date_gmt, false)
            : null,
        'modifiedAt' => $post->post_modified_gmt !== '0000-00-00 00:00:00'
            ? mysql2date(DATE_ATOM, $post->post_modified_gmt, false)
            : null,
        'featuredMediaId' => $featuredMediaId > 0 ? $featuredMediaId : null,
        'scopeRole' => $scopeRole,
        'featuredOrder' => $featuredOrder,
        'taxonomies' => (object) $taxonomyMap,
        'acf' => is_array($normalizedAcf) ? (object) $normalizedAcf : (object) [],
    ]);
}

function tp_export_term(int $termId, string $taxonomy, array &$mediaIds, array &$termIds): void
{
    $term = get_term($termId, $taxonomy);

    if (!$term instanceof WP_Term) {
        return;
    }

    $acf = function_exists('get_fields') ? (get_fields($term) ?: []) : [];
    $normalizedAcf = tp_normalize($acf, $mediaIds, $termIds);

    tp_emit([
        'entity' => 'term',
        'legacyId' => (int) $term->term_id,
        'taxonomy' => (string) $term->taxonomy,
        'name' => (string) $term->name,
        'slug' => (string) $term->slug,
        'description' => (string) $term->description,
        'parentId' => (int) $term->parent,
        'acf' => is_array($normalizedAcf) ? (object) $normalizedAcf : (object) [],
    ]);
}

function tp_export_media(int $mediaId): void
{
    if (get_post_type($mediaId) !== 'attachment') {
        return;
    }

    $metadata = wp_get_attachment_metadata($mediaId);
    $relativePath = get_post_meta($mediaId, '_wp_attached_file', true);
    $resolvedPath = get_attached_file($mediaId);
    $locallyReadable = is_string($resolvedPath) && $resolvedPath !== '' && is_readable($resolvedPath);
    $mimeType = (string) get_post_mime_type($mediaId);
    $alt = (string) get_post_meta($mediaId, '_wp_attachment_image_alt', true);
    $isImage = strpos($mimeType, 'image/') === 0;

    tp_emit([
        'entity' => 'media',
        'legacyId' => $mediaId,
        'title' => html_entity_decode(get_the_title($mediaId), ENT_QUOTES | ENT_HTML5, 'UTF-8'),
        'alt' => $alt,
        'altSource' => $alt !== '' ? 'wordpress' : ($isImage ? 'title-fallback' : 'editor-review'),
        'decorative' => false,
        'needsAltReview' => $isImage && $alt === '',
        'caption' => (string) wp_get_attachment_caption($mediaId),
        'description' => (string) get_post_field('post_content', $mediaId),
        'mimeType' => $mimeType,
        'url' => wp_get_attachment_url($mediaId) ?: null,
        'relativePath' => is_string($relativePath) && $relativePath !== '' ? $relativePath : null,
        'width' => is_array($metadata) && isset($metadata['width']) ? (int) $metadata['width'] : null,
        'height' => is_array($metadata) && isset($metadata['height']) ? (int) $metadata['height'] : null,
        'availability' => $locallyReadable ? 'local' : 'unavailable',
        'availabilityReason' => $locallyReadable
            ? null
            : (
                is_string($resolvedPath) && strpos($resolvedPath, '://') !== false
                    ? 'unsupported-object-storage-path'
                    : 'missing-or-unreadable-local-file'
            ),
    ]);
}

function tp_export_primary_menu(array &$mediaIds, array &$termIds): void
{
    $locations = get_nav_menu_locations();
    $location = isset($locations['primary_navigation'])
        ? 'primary_navigation'
        : (isset($locations['primary']) ? 'primary' : '');

    if ($location === '') {
        return;
    }

    $menuId = (int) $locations[$location];
    $menu = wp_get_nav_menu_object($menuId);
    $items = wp_get_nav_menu_items($menuId, ['post_status' => 'publish']);

    if (!$menu instanceof WP_Term || !is_array($items)) {
        return;
    }

    $normalizedItems = [];
    foreach ($items as $item) {
        $acf = function_exists('get_fields') ? (get_fields($item->ID) ?: []) : [];
        $normalizedAcf = tp_normalize($acf, $mediaIds, $termIds);

        $normalizedItems[] = [
            'legacyId' => (int) $item->ID,
            'parentId' => (int) $item->menu_item_parent,
            'order' => (int) $item->menu_order,
            'title' => (string) $item->title,
            'url' => (string) $item->url,
            'target' => (string) $item->target,
            'description' => (string) $item->description,
            'classes' => array_values(array_filter(array_map('strval', (array) $item->classes))),
            'objectId' => (int) $item->object_id,
            'objectType' => (string) $item->object,
            'itemType' => (string) $item->type,
            'acf' => is_array($normalizedAcf) ? (object) $normalizedAcf : (object) [],
        ];
    }

    usort($normalizedItems, static function (array $left, array $right): int {
        return $left['order'] <=> $right['order'];
    });

    tp_emit([
        'entity' => 'menu',
        'location' => $location,
        'legacyId' => $menuId,
        'name' => (string) $menu->name,
        'items' => $normalizedItems,
    ]);
}

function tp_find_hub_connections(int $hubId): array
{
    $venueIds = get_posts([
        'post_type' => 'venue',
        'post_status' => ['publish', 'draft', 'private'],
        'posts_per_page' => -1,
        'fields' => 'ids',
        'orderby' => 'ID',
        'order' => 'ASC',
        'no_found_rows' => true,
    ]);

    $connections = [];
    $matchedVenueIds = [];

    foreach ($venueIds as $venueId) {
        $rows = function_exists('get_field') ? get_field('connections', $venueId) : [];
        if (!is_array($rows)) {
            continue;
        }

        foreach ($rows as $row) {
            if (!is_array($row) || tp_reference_id($row['hub'] ?? null) !== $hubId) {
                continue;
            }

            // Current ACF data stores this as `type`; older field exports and theme
            // helpers have also referred to it as `connection_type`.
            $connectionType = (string) ($row['type'] ?? $row['connection_type'] ?? '');
            $venueType = function_exists('get_field') ? get_field('type', $venueId) : [];
            $venueTypeId = is_array($venueType)
                ? tp_reference_id($venueType['venue_type'] ?? null)
                : tp_reference_id($venueType);
            $connections[] = [
                'venueLegacyId' => (int) $venueId,
                'venueTypeLegacyId' => $venueTypeId > 0 ? $venueTypeId : null,
                'connectionType' => $connectionType,
                'supportsJoule' => in_array($connectionType, ['d', 'b'], true),
                'supportsAutoTrader' => in_array($connectionType, ['a', 'b'], true),
            ];
            $matchedVenueIds[(int) $venueId] = true;
        }
    }

    usort($connections, static function (array $left, array $right): int {
        return [$left['venueLegacyId'], $left['connectionType']]
            <=> [$right['venueLegacyId'], $right['connectionType']];
    });

    return [
        'connections' => $connections,
        'venueIds' => array_keys($matchedVenueIds),
    ];
}

function tp_export_reusable(
    int $postId,
    array $fields,
    array &$mediaIds,
    array &$termIds,
    array $overrides = []
): void {
    $post = get_post($postId);
    if (!$post instanceof WP_Post) {
        throw new RuntimeException("Reusable source post {$postId} does not exist.");
    }

    $allFields = function_exists('get_fields') ? (get_fields($postId) ?: []) : [];
    $data = [];
    foreach ($fields as $fieldName) {
        if (array_key_exists($fieldName, $allFields)) {
            $data[$fieldName] = $allFields[$fieldName];
        }
    }
    $data = array_merge($data, $overrides);

    tp_emit([
        'entity' => 'reusable',
        'legacyId' => $postId,
        'postType' => (string) $post->post_type,
        'title' => html_entity_decode(get_the_title($postId), ENT_QUOTES | ENT_HTML5, 'UTF-8'),
        'path' => tp_relative_path_for_post($postId),
        'data' => (object) tp_normalize($data, $mediaIds, $termIds),
    ]);
}

function tp_export_curated_reusables(array &$mediaIds, array &$termIds): void
{
    tp_export_reusable(3055, ['stats'], $mediaIds, $termIds);
    tp_export_reusable(
        7665,
        ['image', 'video', 'duration', 'name', 'short_description', 'description'],
        $mediaIds,
        $termIds
    );
    tp_export_reusable(3197, ['pre_title', 'title', 'feature'], $mediaIds, $termIds);

    foreach ([1861, 1883, 1884] as $productId) {
        tp_export_reusable(
            $productId,
            [
                'feature',
                'icon',
                'page_redirect',
                'short_description',
                'color',
                'product_color',
                'image',
                'features',
            ],
            $mediaIds,
            $termIds
        );
    }

    foreach ([2561, 2563, 2570, 2571, 2667, 2668, 2670, 9253, 10395] as $personId) {
        tp_export_reusable(
            $personId,
            ['image', 'name', 'date', 'team', 'job_role', 'description', 'quote', 'external_link'],
            $mediaIds,
            $termIds
        );
    }

    foreach ([
        3097, 3098, 3099, 4442, 4443, 4444, 4445, 4446, 4447, 8550, 8561, 8562, 8563,
        8564, 8565, 8566, 8567, 8569, 8570, 8572, 8620, 8764, 8765, 8766, 8767, 8768,
    ] as $clientId) {
        $clientFields = function_exists('get_fields') ? (get_fields($clientId) ?: []) : [];
        $directLogo = $clientFields['logo'] ?? null;
        $relatedVenue = $clientFields['related_venue'] ?? null;
        $relatedVenueId = tp_reference_id($relatedVenue);
        $usesRelatedVenue = in_array($clientFields['use_related_venue'] ?? false, [true, 1, '1'], true);
        $displayLogo = $directLogo;

        if ($usesRelatedVenue && $relatedVenueId > 0) {
            $displayLogo = function_exists('get_field') ? get_field('logo', $relatedVenueId) : null;
        }

        tp_export_reusable(
            $clientId,
            [
                'company_type',
                'description',
                'testimonial',
                'name',
                'website',
                'use_related_venue',
            ],
            $mediaIds,
            $termIds,
            [
                'display_logo' => $displayLogo,
                'related_venue_legacy_id' => $relatedVenueId > 0 ? $relatedVenueId : null,
            ]
        );
    }
}

function tp_normalized_marker_rows($value): array
{
    $rows = is_array($value) ? $value : [];
    $markers = [];

    foreach ($rows as $row) {
        if (!is_array($row)) {
            continue;
        }
        $latlng = isset($row['latlng']) && is_array($row['latlng']) ? $row['latlng'] : $row;
        $latitude = isset($latlng['lat']) && is_numeric($latlng['lat']) ? (float) $latlng['lat'] : null;
        $longitude = isset($latlng['lng']) && is_numeric($latlng['lng']) ? (float) $latlng['lng'] : null;

        if ($latitude === null || $longitude === null) {
            continue;
        }

        $markers[] = [
            'name' => (string) ($row['name'] ?? $latlng['address'] ?? ''),
            'latitude' => $latitude,
            'longitude' => $longitude,
        ];
    }

    usort($markers, static function (array $left, array $right): int {
        return [$left['name'], $left['latitude'], $left['longitude']]
            <=> [$right['name'], $right['latitude'], $right['longitude']];
    });

    return $markers;
}

function tp_export_map_hubs(array &$termIds): void
{
    $hubIds = get_posts([
        'post_type' => 'hub',
        'post_status' => 'publish',
        'posts_per_page' => -1,
        'fields' => 'ids',
        'orderby' => 'ID',
        'order' => 'ASC',
        'no_found_rows' => true,
    ]);

    foreach ($hubIds as $hubId) {
        $classId = tp_reference_id(function_exists('get_field') ? get_field('class', $hubId) : null);
        $regionId = tp_reference_id(function_exists('get_field') ? get_field('region', $hubId) : null);
        if (!in_array($classId, [21, 22], true) || !in_array($regionId, [29, 30, 31], true)) {
            continue;
        }

        $termIds['asset-class:' . $classId] = ['id' => $classId, 'taxonomy' => 'asset-class'];
        $termIds['region:' . $regionId] = ['id' => $regionId, 'taxonomy' => 'region'];
        $post = get_post($hubId);
        if (!$post instanceof WP_Post) {
            continue;
        }

        tp_emit([
            'entity' => 'map-hub',
            'legacyId' => (int) $hubId,
            'title' => html_entity_decode(get_the_title($hubId), ENT_QUOTES | ENT_HTML5, 'UTF-8'),
            'slug' => (string) $post->post_name,
            'path' => tp_relative_path_for_post($hubId),
            'assetClassLegacyId' => $classId,
            'regionLegacyId' => $regionId,
            'showOnMap' => in_array(
                function_exists('get_field') ? get_field('show_on_map', $hubId) : true,
                [true, 1, '1'],
                true
            ),
            'markers' => tp_normalized_marker_rows(
                function_exists('get_field') ? get_field('marker_locations', $hubId) : []
            ),
        ]);
    }
}

function tp_nullable_decimal($value): ?string
{
    if ($value === null || $value === '' || $value === false) {
        return null;
    }
    if (!is_numeric($value)) {
        return null;
    }

    return (string) $value;
}

function tp_export_market_volume_rows(): void
{
    $sourcePostIds = [6633, 6636, 6639, 6641, 8575, 6679, 6680, 6681, 6683, 10474];
    $rows = [];

    foreach ($sourcePostIds as $sourcePostId) {
        $year = (int) (function_exists('get_field') ? get_field('year', $sourcePostId) : 0);
        $assetClassId = tp_reference_id(
            function_exists('get_field') ? get_field('class', $sourcePostId) : null
        );
        $hubRows = function_exists('get_field') ? get_field('data', $sourcePostId) : [];
        if ($year < 2000 || $assetClassId < 1 || !is_array($hubRows)) {
            continue;
        }

        foreach ($hubRows as $hubRow) {
            if (!is_array($hubRow)) {
                continue;
            }
            $hubId = tp_reference_id($hubRow['hub'] ?? null);
            $months = isset($hubRow['values']) && is_array($hubRow['values'])
                ? $hubRow['values']
                : [];
            if ($hubId < 1) {
                continue;
            }

            foreach ($months as $month => $values) {
                if (!is_array($values) || !is_numeric($month)) {
                    continue;
                }
                $normalized = [
                    'otcBilateral' => tp_nullable_decimal($values['otc_bilateral'] ?? null),
                    'otcCleared' => tp_nullable_decimal($values['otc_cleared'] ?? null),
                    'exchangeTraded' => tp_nullable_decimal($values['exchange_traded'] ?? null),
                    'price' => tp_nullable_decimal($values['price'] ?? null),
                ];
                if (count(array_filter($normalized, static fn($value): bool => $value !== null)) === 0) {
                    continue;
                }

                $rows[] = array_merge([
                    'schemaVersion' => TP_SCHEMA_VERSION,
                    'entity' => 'market-volume',
                    'assetClassLegacyId' => $assetClassId,
                    'hubLegacyId' => $hubId,
                    'year' => $year,
                    'month' => (int) $month,
                    'sourcePostLegacyId' => $sourcePostId,
                ], $normalized);
            }
        }
    }

    usort($rows, static function (array $left, array $right): int {
        return [
            $left['assetClassLegacyId'],
            $left['hubLegacyId'],
            $left['year'],
            $left['month'],
            $left['sourcePostLegacyId'],
        ] <=> [
            $right['assetClassLegacyId'],
            $right['hubLegacyId'],
            $right['year'],
            $right['month'],
            $right['sourcePostLegacyId'],
        ];
    });

    foreach ($rows as $row) {
        $json = wp_json_encode($row, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);
        if ($json === false) {
            throw new RuntimeException('Could not encode market-volume export record.');
        }
        fwrite(STDOUT, $json . PHP_EOL);
    }
}

function tp_emit_warning(
    string $code,
    string $severity,
    string $message,
    ?int $legacyId = null,
    ?string $sourcePath = null
): void {
    tp_emit([
        'entity' => 'warning',
        'code' => $code,
        'severity' => $severity,
        'legacyId' => $legacyId,
        'sourcePath' => $sourcePath,
        'message' => $message,
    ]);
}

$rootIds = array_values(array_unique(array_filter(array_map(
    'intval',
    explode(',', (string) getenv('TP_POC_ROOT_IDS'))
))));

if (!$rootIds) {
    fwrite(STDERR, "TP_POC_ROOT_IDS must contain at least one post ID.\n");
    exit(2);
}

if (!function_exists('get_fields')) {
    fwrite(STDERR, "Advanced Custom Fields is not loaded.\n");
    exit(2);
}

global $wpdb;

tp_emit([
    'entity' => 'manifest',
    'source' => [
        'home' => (string) home_url('/'),
        'site' => (string) site_url('/'),
        'tablePrefix' => (string) $wpdb->prefix,
        'wordpressVersion' => (string) get_bloginfo('version'),
        'acfVersion' => defined('ACF_VERSION') ? (string) ACF_VERSION : 'unknown',
    ],
    'rootIds' => $rootIds,
]);

$hubId = (int) getenv('TP_POC_HUB_ID');
$hubConnections = $hubId > 0
    ? tp_find_hub_connections($hubId)
    : ['connections' => [], 'venueIds' => []];

$mediaIds = [];
$termIds = [];

foreach ($rootIds as $postId) {
    $postType = get_post_type($postId);
    if ($postType === 'page') {
        tp_export_post(
            (int) $postId,
            $mediaIds,
            $termIds,
            ['sections_new', 'page_settings'],
            true,
            'root'
        );
    } elseif ($postType === 'post') {
        tp_export_post(
            (int) $postId,
            $mediaIds,
            $termIds,
            ['article_header', 'location', 'display_date', 'featured', 'sections', 'page_settings'],
            false,
            'root'
        );
    } elseif ($postType === 'hub') {
        tp_export_post(
            (int) $postId,
            $mediaIds,
            $termIds,
            [
                'class',
                'region',
                'image',
                'code',
                'show_on_map',
                'marker_locations',
                'latlng',
                'page_settings',
            ],
            true,
            'root'
        );
    } else {
        tp_export_post((int) $postId, $mediaIds, $termIds, null, true, 'root');
    }
}

$insightsIds = get_posts([
    'post_type' => 'post',
    'post_status' => 'publish',
    'posts_per_page' => -1,
    'fields' => 'ids',
    'category' => 120,
    'orderby' => 'ID',
    'order' => 'ASC',
    'no_found_rows' => true,
]);
$featuredOrder = array_flip([11694, 11553, 11203, 10790]);
foreach ($insightsIds as $articleId) {
    if (in_array((int) $articleId, $rootIds, true)) {
        continue;
    }
    $isFeatured = isset($featuredOrder[(int) $articleId]);
    tp_export_post(
        (int) $articleId,
        $mediaIds,
        $termIds,
        ['article_header', 'display_date', 'featured', 'page_settings'],
        $isFeatured,
        'insights-listing',
        $isFeatured ? (int) $featuredOrder[(int) $articleId] : null
    );
}

if ($hubId > 0) {
    tp_emit([
        'entity' => 'hub-connections',
        'hubLegacyId' => $hubId,
        'connections' => $hubConnections['connections'],
    ]);

    foreach ($hubConnections['venueIds'] as $venueId) {
        tp_export_post(
            (int) $venueId,
            $mediaIds,
            $termIds,
            ['type', 'display_name', 'website'],
            false,
            'venue-summary'
        );
    }
}

$safeOptions = [
    'dropdown' => get_field('dropdown', 'option'),
    'footer_new' => get_field('footer_new', 'option'),
    'legal' => [
        'disclaimer' => get_field('paragraph', 4819),
        'address' => get_field('text', 4818),
        'company_number' => get_field('text', 4808),
    ],
];
tp_emit([
    'entity' => 'options',
    'values' => (object) tp_normalize($safeOptions, $mediaIds, $termIds),
]);

tp_export_curated_reusables($mediaIds, $termIds);
tp_export_map_hubs($termIds);
tp_export_market_volume_rows();

tp_emit_warning(
    'curated-exclusion',
    'info',
    'Commodities Report (page 2233) is excluded from the PoC navigation by policy.',
    2233,
    'options.dropdown'
);
tp_emit_warning(
    'stale-private-link',
    'warning',
    'Private legacy Careers page 2207 is still referenced by About Us and the footer.',
    2207,
    'pages.2203/options.footer_new'
);
tp_emit_warning(
    'legacy-link-mismatch',
    'warning',
    'The final article CTA says Data Analytics but links to Climate page 2213.',
    2213,
    'posts.9351.sections'
);
tp_emit_warning(
    'unresolved-inline-media',
    'warning',
    'Werner-Zwie-2-272x300.jpg is referenced inline but is unavailable; attachment class 10253 is unrelated.',
    9351,
    'posts.9351.sections'
);
tp_emit_warning(
    'legacy-host-rewrite',
    'warning',
    'Article 9351 rich text contains an old trayport.kayson.io URL requiring rewrite review.',
    9351,
    'posts.9351.sections'
);
tp_emit_warning(
    'blank-link-destination',
    'warning',
    'Home contains a See the Regions Map link with a blank destination.',
    1898,
    'pages.1898.sections_new'
);
tp_emit_warning(
    'development-override-ignored',
    'info',
    'Insights has the legacy lipsum override enabled; the authored hero is imported instead.',
    9248,
    'pages.9248.page_settings.lipsum'
);

$exportedTerms = [];
while ($termIds) {
    ksort($termIds);
    $nextTerms = $termIds;
    $termIds = [];

    foreach ($nextTerms as $key => $termRef) {
        if (isset($exportedTerms[$key])) {
            continue;
        }
        $exportedTerms[$key] = true;
        tp_export_term((int) $termRef['id'], (string) $termRef['taxonomy'], $mediaIds, $termIds);
    }
}

ksort($mediaIds);
foreach (array_keys($mediaIds) as $mediaId) {
    tp_export_media((int) $mediaId);
}
