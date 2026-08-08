<?php

/**
 * Export the bounded Trayport production-pilot source graph through WordPress and ACF.
 *
 * Run only from an already bootstrapped WP-CLI process:
 *   TP_PILOT_ROOT_IDS=1898,2203 wp eval-file /tmp/trayport-export.php
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

/**
 * Read only the active, public first-visit cookie notice content. The plugin's
 * preference categories and vendor data deliberately remain outside the pilot.
 */
function tp_cookie_notice(): array
{
    $templates = get_option('wcc_banner_template_gdpr-1');
    $html = is_array($templates) && isset($templates['en']['html'])
        ? (string) $templates['en']['html']
        : '';

    if ($html === '' || !class_exists('DOMDocument')) {
        return [];
    }

    $previousErrors = libxml_use_internal_errors(true);
    $document = new DOMDocument();
    $loaded = $document->loadHTML(
        '<?xml encoding="utf-8" ?>' . $html,
        LIBXML_HTML_NOIMPLIED | LIBXML_HTML_NODEFDTD
    );
    libxml_clear_errors();
    libxml_use_internal_errors($previousErrors);

    if (!$loaded) {
        return [];
    }

    $xpath = new DOMXPath($document);
    $text = static function (?DOMNode $node): string {
        if (!$node) {
            return '';
        }

        return trim((string) preg_replace('/\s+/u', ' ', html_entity_decode(
            $node->textContent,
            ENT_QUOTES | ENT_HTML5,
            'UTF-8'
        )));
    };
    $first = static function (DOMXPath $xpath, string $query): ?DOMNode {
        $nodes = $xpath->query($query);

        return $nodes && $nodes->length > 0 ? $nodes->item(0) : null;
    };

    $container = $first($xpath, '//*[@data-tag="notice"]');
    $titleNode = $first($xpath, '//*[@id="wcc-title"]');
    $descriptionNode = $first($xpath, '//*[@id="wcc-notice-des"]');
    $policyNode = $first($xpath, '//*[@id="wcc-notice-des"]//a[1]');
    $acceptNode = $first($xpath, '//*[@data-tag="accept-button"]');
    $rejectNode = $first($xpath, '//*[@data-tag="reject-button"]');
    $policyLabel = $text($policyNode);
    $message = $text($descriptionNode);

    if ($policyLabel !== '') {
        $position = strrpos($message, $policyLabel);
        if ($position !== false) {
            $message = rtrim(substr($message, 0, $position));
        }
    }

    $policyUrl = $policyNode instanceof DOMElement ? $policyNode->getAttribute('href') : '';
    $policyPath = $policyUrl !== '' ? wp_parse_url($policyUrl, PHP_URL_PATH) : null;

    return [
        'enabled' => $container !== null,
        'title' => $text($titleNode),
        'message' => $message,
        'policy_label' => $policyLabel,
        'policy_path' => is_string($policyPath) ? $policyPath : null,
        'accept_label' => $text($acceptNode),
        'reject_label' => $text($rejectNode),
    ];
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
    $fileHash = $locallyReadable ? hash_file('sha256', $resolvedPath) : null;
    $metadataFileSize = is_array($metadata) && isset($metadata['filesize'])
        ? (int) $metadata['filesize']
        : null;
    $fileSize = $locallyReadable ? filesize($resolvedPath) : $metadataFileSize;
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
        'fileSize' => is_int($fileSize) && $fileSize > 0 ? $fileSize : null,
        'fileHash' => is_string($fileHash) ? $fileHash : null,
        'url' => wp_get_attachment_url($mediaId) ?: null,
        'relativePath' => is_string($relativePath) && $relativePath !== '' ? $relativePath : null,
        'recoveryURL' => null,
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
        'status' => (string) $post->post_status,
        'title' => html_entity_decode(get_the_title($postId), ENT_QUOTES | ENT_HTML5, 'UTF-8'),
        'path' => tp_relative_path_for_post($postId),
        'menuOrder' => (int) $post->menu_order,
        'publishedAt' => $post->post_date_gmt !== '0000-00-00 00:00:00'
            ? mysql2date(DATE_ATOM, $post->post_date_gmt, false)
            : null,
        'modifiedAt' => $post->post_modified_gmt !== '0000-00-00 00:00:00'
            ? mysql2date(DATE_ATOM, $post->post_modified_gmt, false)
            : null,
        'data' => (object) tp_normalize($data, $mediaIds, $termIds),
    ]);
}

function tp_banner_date_to_atom($value): ?string
{
    if (!is_string($value) || trim($value) === '') {
        return null;
    }

    $date = DateTimeImmutable::createFromFormat('Y-m-d H:i:s', trim($value), wp_timezone());

    return $date instanceof DateTimeImmutable ? $date->format(DATE_ATOM) : null;
}

/**
 * Export the live reusable banner system and return every Page dependency needed
 * for targeting or managed banner links, retaining which relationship made each
 * non-root Page reachable.
 */
function tp_export_banner_reusables(array &$mediaIds, array &$termIds): array
{
    $bannerIds = get_posts([
        'post_type' => 'banner',
        'post_status' => ['publish', 'draft', 'pending', 'future', 'private'],
        'posts_per_page' => -1,
        'fields' => 'ids',
        'orderby' => [
            'menu_order' => 'ASC',
            'date' => 'DESC',
        ],
        'no_found_rows' => true,
    ]);
    $pageRoles = [];

    foreach (array_values($bannerIds) as $displayOrder => $bannerId) {
        $bannerId = (int) $bannerId;
        $fields = function_exists('get_fields') ? (get_fields($bannerId) ?: []) : [];
        $liveDates = is_array($fields['live_dates'] ?? null) ? $fields['live_dates'] : [];
        $notifyUsers = is_array($fields['notify_users'] ?? null) ? $fields['notify_users'] : [];
        $recipientEmails = [];

        foreach ($notifyUsers as $user) {
            $userId = tp_reference_id($user);
            $wpUser = $userId > 0 ? get_user_by('id', $userId) : false;
            if ($wpUser instanceof WP_User && is_email($wpUser->user_email)) {
                $recipientEmails[] = strtolower((string) $wpUser->user_email);
            }
        }

        foreach ((array) ($fields['pages'] ?? []) as $page) {
            $pageId = tp_reference_id($page);
            if ($pageId > 0 && get_post_type($pageId) === 'page') {
                $pageRoles[$pageId] = 'banner-target';
            }
        }

        $link = is_array($fields['link'] ?? null) ? $fields['link'] : [];
        $linkedPageId = tp_reference_id($link['value'] ?? null);
        if ($linkedPageId > 0 && get_post_type($linkedPageId) === 'page') {
            $pageRoles[$linkedPageId] = $pageRoles[$linkedPageId] ?? 'banner-action';
        }

        tp_export_reusable(
            $bannerId,
            ['live_dates', 'position', 'layout', 'bg_color', 'show_on', 'pages', 'image', 'header', 'text', 'link'],
            $mediaIds,
            $termIds,
            [
                'start_at' => tp_banner_date_to_atom($liveDates['from'] ?? null),
                'end_at' => tp_banner_date_to_atom($liveDates['to'] ?? null),
                'display_order' => $displayOrder,
                'notification_recipient_emails' => array_values(array_unique($recipientEmails)),
            ]
        );
    }

    ksort($pageRoles);

    return $pageRoles;
}

/**
 * Resolve the small, curated shortcode vocabulary used by the public company
 * registration records. This intentionally does not execute arbitrary
 * WordPress shortcodes; it reads the active `shortcode` record and only emits
 * its bounded text, paragraph, or link value.
 */
function tp_resolve_company_shortcode(string $value): string
{
    return (string) preg_replace_callback('/\[[^\]]+\]/', static function (array $matches): string {
        $ids = get_posts([
            'post_type' => 'shortcode',
            'post_status' => 'publish',
            'posts_per_page' => 1,
            'fields' => 'ids',
            'no_found_rows' => true,
            'meta_query' => [[
                'key' => 'shortcode',
                'value' => (string) $matches[0],
            ]],
        ]);
        $shortcodeId = isset($ids[0]) ? (int) $ids[0] : 0;
        if ($shortcodeId <= 0) {
            return '';
        }

        $type = (string) get_field('type', $shortcodeId);
        if ($type === 'text') {
            return (string) get_field('text', $shortcodeId);
        }
        if ($type === 'paragraph') {
            return (string) get_field('paragraph', $shortcodeId);
        }
        if ($type === 'link') {
            $link = get_field('link', $shortcodeId);
            if (!is_array($link) || empty($link['url']) || empty($link['title'])) {
                return '';
            }

            $target = ($link['target'] ?? '') === '_blank' ? ' target="_blank" rel="noopener noreferrer"' : '';

            return '<a href="' . esc_url((string) $link['url']) . '"' . $target . '>'
                . esc_html((string) $link['title']) . '</a>';
        }

        return '';
    }, $value);
}

function tp_export_company_data_reusable(
    int $postId,
    array &$mediaIds,
    array &$termIds
): void {
    $post = get_post($postId);
    if (!$post instanceof WP_Post || $post->post_type !== 'company-data') {
        throw new RuntimeException("Company-data source post {$postId} does not exist.");
    }

    $fields = function_exists('get_fields') ? (get_fields($postId) ?: []) : [];
    $keys = [
        'name',
        'company_type',
        'nature_of_business',
        'professional_law',
        'phone',
        'email',
        'vat_id',
        'company_number',
        'commercial_register',
        'registered_in',
        'registered_office',
    ];
    $data = [];
    foreach ($keys as $key) {
        $value = $fields[$key] ?? '';
        $data[$key] = is_string($value) ? tp_resolve_company_shortcode($value) : $value;
    }

    foreach (['directors', 'company_secretary'] as $key) {
        $people = is_array($fields[$key] ?? null) ? $fields[$key] : [];
        $data[$key] = array_values(array_filter(array_map(static function ($person): string {
            $personId = tp_reference_id($person);
            if ($personId <= 0) {
                return '';
            }

            return trim((string) (get_field('name', $personId) ?: get_the_title($personId)));
        }, $people)));
    }

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
    tp_export_reusable(3838, ['stats'], $mediaIds, $termIds);
    tp_export_reusable(
        7665,
        ['image', 'video', 'duration', 'name', 'short_description', 'description'],
        $mediaIds,
        $termIds
    );
    tp_export_reusable(3197, ['pre_title', 'title', 'feature'], $mediaIds, $termIds);

    foreach ([752, 753, 754, 811, 1861, 1866, 1883, 1884] as $productId) {
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

    foreach ([4052, 4055, 4056, 4057] as $officeId) {
        tp_export_reusable(
            $officeId,
            ['image', 'name', 'address_prefix', 'address', 'phone', 'email', 'map_zoom'],
            $mediaIds,
            $termIds
        );
    }

    $personIds = get_posts([
        'post_type' => 'people',
        'post_status' => 'publish',
        'posts_per_page' => -1,
        'fields' => 'ids',
        'orderby' => 'ID',
        'order' => 'ASC',
        'no_found_rows' => true,
    ]);
    foreach ($personIds as $personId) {
        tp_export_reusable(
            (int) $personId,
            ['image', 'name', 'date', 'team', 'job_role', 'description', 'quote', 'external_link', 'page_settings'],
            $mediaIds,
            $termIds
        );
    }

    foreach ([4846, 4848, 4849, 4850] as $companyDataId) {
        tp_export_company_data_reusable($companyDataId, $mediaIds, $termIds);
    }

    /*
     * Every published client, not a hand-listed subset.
     *
     * A `clients` component can select by company type rather than by naming each client, and the
     * curated list of 26 held only 2 of the 17 exchanges — so /products/exchange-trading-system/
     * rendered its "Our Exchange Clients" heading above an empty block. Exporting the class rather
     * than an enumeration means a type selection resolves for any component that uses one.
     */
    $clientIds = get_posts([
        'fields' => 'ids',
        'no_found_rows' => true,
        'numberposts' => -1,
        'order' => 'ASC',
        'orderby' => 'ID',
        'post_status' => 'publish',
        'post_type' => 'clients',
        'suppress_filters' => true,
    ]);

    foreach ($clientIds as $clientId) {
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

/** Export only published lifecycle records and the fields used by the managed table. */
function tp_export_lifecycle_reusables(array &$mediaIds, array &$termIds): void
{
    $lifecycleIds = get_posts([
        'post_type' => 'lifecycle',
        'post_status' => 'publish',
        'posts_per_page' => -1,
        'orderby' => 'ID',
        'order' => 'ASC',
        'fields' => 'ids',
        'no_found_rows' => true,
    ]);

    foreach ($lifecycleIds as $lifecycleId) {
        tp_export_reusable(
            (int) $lifecycleId,
            ['product', 'name', 'duration', 'eol_version', 'eol_date', 'eoa_date', 'description'],
            $mediaIds,
            $termIds
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

function tp_normalized_map_coordinates($value): ?array
{
    if (!is_array($value)) {
        return null;
    }
    $latitude = isset($value['lat']) && is_numeric($value['lat']) ? (float) $value['lat'] : null;
    $longitude = isset($value['lng']) && is_numeric($value['lng']) ? (float) $value['lng'] : null;
    if ($latitude === null || $longitude === null || $latitude < -90 || $latitude > 90 || $longitude < -180 || $longitude > 180) {
        return null;
    }
    return ['latitude' => $latitude, 'longitude' => $longitude];
}

function tp_normalized_geojson($value)
{
    if (is_string($value)) {
        $decoded = json_decode($value, true);
        if (json_last_error() !== JSON_ERROR_NONE) {
            return null;
        }
        $value = $decoded;
    }
    if (!is_array($value)) {
        return null;
    }
    $type = (string) ($value['type'] ?? '');
    if (!in_array($type, ['FeatureCollection', 'Feature', 'Point', 'LineString', 'MultiLineString', 'Polygon', 'MultiPolygon'], true)) {
        return null;
    }
    return $value;
}

function tp_export_map_regions(array &$termIds): void
{
    $regionIds = get_posts([
        'post_type' => 'region',
        'post_status' => 'publish',
        'posts_per_page' => -1,
        'fields' => 'ids',
        'orderby' => 'ID',
        'order' => 'ASC',
        'no_found_rows' => true,
    ]);

    foreach ($regionIds as $regionId) {
        $fields = function_exists('get_fields') ? (get_fields($regionId) ?: []) : [];
        $regionLegacyId = tp_reference_id($fields['region_taxonomy'] ?? null);
        if ($regionLegacyId <= 0) {
            throw new RuntimeException("Map region {$regionId} has no managed region taxonomy.");
        }
        $termIds['region:' . $regionLegacyId] = ['id' => $regionLegacyId, 'taxonomy' => 'region'];
        $points = [];
        foreach (is_array($fields['marker_locations'] ?? null) ? $fields['marker_locations'] : [] as $row) {
            if (!is_array($row)) {
                continue;
            }
            $location = tp_normalized_map_coordinates($row['latlng'] ?? null);
            if (!$location) {
                continue;
            }
            $points[] = [
                'label' => (string) ($row['name'] ?? $row['title'] ?? ''),
                'popupText' => wp_strip_all_tags((string) ($row['popup_text'] ?? '')),
                'latitude' => $location['latitude'],
                'longitude' => $location['longitude'],
            ];
        }
        $redirect = $fields['page_redirect'] ?? null;
        $redirectId = tp_reference_id(is_array($redirect) ? ($redirect[0] ?? null) : $redirect);

        tp_emit([
            'entity' => 'map-region',
            'legacyId' => (int) $regionId,
            'title' => html_entity_decode(get_the_title($regionId), ENT_QUOTES | ENT_HTML5, 'UTF-8'),
            'regionLegacyId' => $regionLegacyId,
            'label' => (string) ($fields['map_label'] ?? $fields['abbreviation'] ?? ''),
            'centre' => tp_normalized_map_coordinates($fields['latlng'] ?? null),
            'boundary' => tp_normalized_geojson($fields['geojson'] ?? null),
            'pointsOfInterest' => $points,
            'destinationPath' => $redirectId > 0 ? tp_relative_path_for_post($redirectId) : null,
        ]);
    }
}

function tp_export_map_hubs(array &$termIds): void
{
    $assetClassTerms = get_terms([
        'taxonomy' => 'asset-class',
        'hide_empty' => false,
    ]);
    if (is_wp_error($assetClassTerms)) {
        throw new RuntimeException('Could not enumerate Market Matrix asset classes.');
    }
    foreach ($assetClassTerms as $term) {
        $termId = (int) $term->term_id;
        $termIds['asset-class:' . $termId] = ['id' => $termId, 'taxonomy' => 'asset-class'];
    }

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
        if ($classId <= 0 || $regionId <= 0) {
            throw new RuntimeException("Market Matrix hub {$hubId} is missing its asset class or region.");
        }

        $termIds['asset-class:' . $classId] = ['id' => $classId, 'taxonomy' => 'asset-class'];
        $termIds['region:' . $regionId] = ['id' => $regionId, 'taxonomy' => 'region'];
        $post = get_post($hubId);
        if (!$post instanceof WP_Post) {
            continue;
        }
        $fields = function_exists('get_fields') ? (get_fields($hubId) ?: []) : [];
        $location = is_array($fields['location'] ?? null) ? $fields['location'] : [];
        $countryCode = strtoupper((string) ($location['code'] ?? ''));
        if (!preg_match('/^[A-Z]{3}$/', $countryCode)) {
            $countryCode = null;
        }
        $connectedCountryCodes = [];
        foreach (is_array($fields['connected_locations'] ?? null) ? $fields['connected_locations'] : [] as $connectedLocation) {
            $code = strtoupper((string) (is_array($connectedLocation) ? ($connectedLocation['code'] ?? '') : ''));
            if (preg_match('/^[A-Z]{3}$/', $code)) {
                $connectedCountryCodes[$code] = true;
            }
        }
        $connections = [];
        foreach (is_array($fields['connected_hubs'] ?? null) ? $fields['connected_hubs'] : [] as $row) {
            if (!is_array($row)) {
                continue;
            }
            $connectedHubId = tp_reference_id($row['hub'] ?? null);
            if ($connectedHubId <= 0 || $connectedHubId === (int) $hubId) {
                continue;
            }
            $connections[] = [
                'hubLegacyId' => $connectedHubId,
                'route' => tp_normalized_geojson($row['line'] ?? null),
                'showLineMarker' => in_array($row['line_marker'] ?? false, [true, 1, '1'], true),
                'lineMarkerLabel' => html_entity_decode(get_the_title($connectedHubId), ENT_QUOTES | ENT_HTML5, 'UTF-8'),
            ];
        }
        $hubType = (string) ($fields['venue_type'] ?? 'vhub');
        if (!in_array($hubType, ['vhub', 'phub', 'ohub', 'rhub'], true)) {
            $hubType = 'vhub';
        }

        tp_emit([
            'entity' => 'map-hub',
            'legacyId' => (int) $hubId,
            'title' => html_entity_decode(get_the_title($hubId), ENT_QUOTES | ENT_HTML5, 'UTF-8'),
            'slug' => (string) $post->post_name,
            'path' => tp_relative_path_for_post($hubId),
            'assetClassLegacyId' => $classId,
            'regionLegacyId' => $regionId,
            'countryCode' => $countryCode,
            'connectedCountryCodes' => array_keys($connectedCountryCodes),
            'hubType' => $hubType,
            'showOnMap' => in_array(
                function_exists('get_field') ? get_field('show_on_map', $hubId) : true,
                [true, 1, '1'],
                true
            ),
            'markers' => tp_normalized_marker_rows(
                $fields['marker_locations'] ?? []
            ),
            'connections' => $connections,
        ]);
    }
}

/**
 * Export every published venue used by the Market Matrix. This deliberately
 * does not depend on TP_POC_HUB_ID: that variable only drives the legacy
 * German Power relationship projection, whereas the Matrix is a site-wide
 * venue-to-hub dataset.
 */
function tp_export_market_matrix_venues(array $rootIds, array &$mediaIds, array &$termIds): void
{
    $venueIds = get_posts([
        'post_type' => 'venue',
        'post_status' => 'publish',
        'posts_per_page' => -1,
        'fields' => 'ids',
        'orderby' => 'ID',
        'order' => 'ASC',
        'no_found_rows' => true,
    ]);

    foreach ($venueIds as $venueId) {
        if (in_array((int) $venueId, $rootIds, true)) {
            continue;
        }
        tp_export_post(
            (int) $venueId,
            $mediaIds,
            $termIds,
            ['type', 'display_name', 'website', 'connections'],
            false,
            'venue-summary'
        );
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
    explode(',', (string) (getenv('TP_PILOT_ROOT_IDS') ?: getenv('TP_POC_ROOT_IDS')))
))));

if (!$rootIds) {
    fwrite(STDERR, "TP_PILOT_ROOT_IDS must contain at least one post ID.\n");
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

// Featured Insights carry an explicit running order. Defined before the root loop so posts that
// own a public route keep their order rather than losing it to root-depth export.
$featuredOrder = array_flip([11694, 11553, 11203, 10790]);

foreach ($rootIds as $postId) {
    $postType = get_post_type($postId);
    if ($postType === 'page') {
        $template = (string) get_page_template_slug($postId);
        $pageFields = (int) $postId === 4031
            ? ['page_settings']
            : ($template === 'layouts/article.blade.php'
                ? ['article_header', 'sections', 'page_settings']
                : ['sections_new', 'page_settings']);
        tp_export_post(
            (int) $postId,
            $mediaIds,
            $termIds,
            $pageFields,
            true,
            'root'
        );
    } elseif ($postType === 'post') {
        $isFeaturedRoot = isset($featuredOrder[(int) $postId]);
        tp_export_post(
            (int) $postId,
            $mediaIds,
            $termIds,
            ['article_header', 'location', 'display_date', 'featured', 'sections', 'page_settings'],
            true,
            'root',
            $isFeaturedRoot ? (int) $featuredOrder[(int) $postId] : null
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
    } elseif ($postType === 'learning-hub-video') {
        // Protected video binaries are deliberately excluded. The pilot publishes
        // metadata/gate pages, never subscriber-only media.
        tp_export_post(
            (int) $postId,
            $mediaIds,
            $termIds,
            [
                'categories',
                'tags',
                'order',
                'permissions',
                'product',
                'image',
                'duration',
                'name',
                'short_description',
                'description',
                'page_settings',
            ],
            false,
            'root'
        );
    } else {
        tp_export_post((int) $postId, $mediaIds, $termIds, null, true, 'root');
    }
}

$bannerPageRoles = tp_export_banner_reusables($mediaIds, $termIds);
foreach ($bannerPageRoles as $pageId => $scopeRole) {
    if (in_array((int) $pageId, $rootIds, true)) {
        continue;
    }
    $template = (string) get_page_template_slug($pageId);
    $pageFields = $template === 'layouts/article.blade.php'
        ? ['article_header', 'sections', 'page_settings']
        : ['sections_new', 'page_settings'];
    tp_export_post(
        (int) $pageId,
        $mediaIds,
        $termIds,
        $pageFields,
        true,
        $scopeRole
    );
}

$newsIds = get_posts([
    'post_type' => 'post',
    'post_status' => 'publish',
    'posts_per_page' => -1,
    'fields' => 'ids',
    'category' => 111,
    'orderby' => 'ID',
    'order' => 'ASC',
    'no_found_rows' => true,
]);
foreach ($newsIds as $articleId) {
    if (in_array((int) $articleId, $rootIds, true)) {
        continue;
    }
    tp_export_post(
        (int) $articleId,
        $mediaIds,
        $termIds,
        ['article_header', 'display_date', 'featured', 'page_settings'],
        true,
        'news-listing'
    );
}

$learningVideoIds = get_posts([
    'post_type' => 'learning-hub-video',
    'post_status' => 'publish',
    'posts_per_page' => -1,
    'fields' => 'ids',
    'orderby' => 'ID',
    'order' => 'ASC',
    'no_found_rows' => true,
]);
foreach ($learningVideoIds as $videoId) {
    if (in_array((int) $videoId, $rootIds, true)) {
        continue;
    }
    tp_export_post(
        (int) $videoId,
        $mediaIds,
        $termIds,
        [
            'categories',
            'tags',
            'order',
            'permissions',
            'product',
            'image',
            'duration',
            'name',
            'short_description',
            'page_settings',
        ],
        false,
        'learning-listing'
    );
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

$eventArticleIds = get_posts([
    'post_type' => 'post',
    'post_status' => 'publish',
    'posts_per_page' => -1,
    'fields' => 'ids',
    'category' => 119,
    'orderby' => 'ID',
    'order' => 'ASC',
    'no_found_rows' => true,
]);
foreach ($eventArticleIds as $articleId) {
    if (in_array((int) $articleId, $rootIds, true)) {
        continue;
    }
    tp_export_post(
        (int) $articleId,
        $mediaIds,
        $termIds,
        [
            'tag_text',
            'article_header',
            'location',
            'display_date',
            'show_contents',
            'show_related',
            'show_social',
            'sections',
            'page_settings',
        ],
        true,
        'event-listing'
    );
}

$legacyEventIds = get_posts([
    'post_type' => 'events',
    'post_status' => 'publish',
    'posts_per_page' => -1,
    'fields' => 'ids',
    'orderby' => 'ID',
    'order' => 'ASC',
    'no_found_rows' => true,
]);
foreach ($legacyEventIds as $eventId) {
    // Legacy Event records that own a canonical /event/ route are exported at root depth by the
    // root loop above. Every other listing loop already skips roots; without the same guard here
    // those records would be emitted twice and the second, shallower copy would win on load.
    if (in_array((int) $eventId, $rootIds, true)) {
        continue;
    }
    tp_export_post(
        (int) $eventId,
        $mediaIds,
        $termIds,
        [
            'name',
            'latlng',
            'start_date',
            'date',
            'short_description',
            'description',
            'page_content',
            'form_title',
            'hubspot_form_id',
            'page_settings',
        ],
        true,
        'event-listing'
    );
}

if ($hubId > 0) {
    tp_emit([
        'entity' => 'hub-connections',
        'hubLegacyId' => $hubId,
        'connections' => $hubConnections['connections'],
    ]);
}

tp_export_market_matrix_venues($rootIds, $mediaIds, $termIds);

$safeOptions = [
    'dropdown' => get_field('dropdown', 'option'),
    'footer_new' => get_field('footer_new', 'option'),
    'footer_company_registration_text' => get_field('footer_company_registration_text', 'option'),
    'footer_parent_company_text' => get_field('footer_parent_company_text', 'option'),
    'cookie_notice' => tp_cookie_notice(),
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
tp_export_lifecycle_reusables($mediaIds, $termIds);
tp_export_map_regions($termIds);
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
    'deferred-hubspot-form',
    'info',
    'The unused Contact sales-enquiry HubSpot form is intentionally omitted from the managed contact-details page.',
    34,
    'pages.34.sections_new.1.columns.0.components.1'
);
tp_emit_warning(
    'deferred-hubspot-form',
    'info',
    'The unused Contact general-enquiry HubSpot form is intentionally omitted from the managed contact-details page.',
    34,
    'pages.34.sections_new.1.columns.0.components.5'
);
tp_emit_warning(
    'protected-learning-media',
    'info',
    'Learning Hub video binaries are subscriber-only and are not exported to Payload media.',
    8454,
    'learning-hub-video.permissions'
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
