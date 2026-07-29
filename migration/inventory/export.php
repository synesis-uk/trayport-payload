<?php

/**
 * Produce a reference-only snapshot for the production content inventory.
 *
 * This intentionally emits identities, routes, relationships, listing selectors,
 * and media/term metadata only. Authored field values and secret-shaped option
 * data never leave WordPress.
 */

if (!defined('ABSPATH') || !defined('WP_CLI')) {
    fwrite(STDERR, "This inventory exporter must run through WP-CLI.\n");
    exit(2);
}

const TP_INVENTORY_SCHEMA_VERSION = 1;

function tp_inventory_path_for_url(?string $url): ?string
{
    if (!is_string($url) || trim($url) === '') {
        return null;
    }

    $path = wp_parse_url($url, PHP_URL_PATH);
    if (!is_string($path) || $path === '') {
        return '/';
    }

    return '/' . ltrim($path, '/');
}

function tp_inventory_sanitize_url(?string $url): ?string
{
    if (!is_string($url) || trim($url) === '') {
        return null;
    }

    $url = trim(html_entity_decode($url, ENT_QUOTES | ENT_HTML5, 'UTF-8'));
    if (str_starts_with($url, '//')) {
        $url = (is_ssl() ? 'https:' : 'http:') . $url;
    }
    if (str_starts_with($url, '/')) {
        $url = home_url($url);
    }

    $parts = wp_parse_url($url);
    if (!is_array($parts)) {
        return null;
    }

    $scheme = isset($parts['scheme']) ? strtolower((string) $parts['scheme']) : '';
    if ($scheme !== '' && !in_array($scheme, ['http', 'https'], true)) {
        return null;
    }

    $host = isset($parts['host']) ? strtolower((string) $parts['host']) : '';
    $path = isset($parts['path']) && is_string($parts['path']) && $parts['path'] !== ''
        ? '/' . ltrim($parts['path'], '/')
        : '/';
    $query = [];
    if (isset($parts['query']) && is_string($parts['query'])) {
        parse_str($parts['query'], $query);
    }

    if ($host === '') {
        return $path;
    }

    $port = isset($parts['port']) ? ':' . (int) $parts['port'] : '';
    $base = ($scheme !== '' ? $scheme : 'https') . '://' . $host . $port . $path;

    // page_id is required to inventory stale private WordPress links. All other
    // query parameters are presentation/tracking data and are intentionally removed.
    if (isset($query['page_id']) && is_numeric($query['page_id'])) {
        return $base . '?page_id=' . (int) $query['page_id'];
    }

    return $base;
}

function tp_inventory_post_path(int $postId): ?string
{
    $url = get_permalink($postId);
    return is_string($url) ? tp_inventory_path_for_url($url) : null;
}

function tp_inventory_resolve_url_post_id(?string $url): int
{
    $sanitized = tp_inventory_sanitize_url($url);
    if ($sanitized === null) {
        return 0;
    }

    $parts = wp_parse_url($sanitized);
    if (is_array($parts) && isset($parts['query']) && is_string($parts['query'])) {
        parse_str($parts['query'], $query);
        if (isset($query['page_id']) && is_numeric($query['page_id'])) {
            return get_post((int) $query['page_id']) instanceof WP_Post ? (int) $query['page_id'] : 0;
        }
    }

    $absolute = str_starts_with($sanitized, '/')
        ? home_url($sanitized)
        : $sanitized;
    $postId = (int) url_to_postid($absolute);
    if ($postId > 0) {
        return $postId;
    }

    $path = tp_inventory_path_for_url($absolute);
    if ($path === null || $path === '/') {
        return 0;
    }

    $slug = trim($path, '/');
    $page = get_page_by_path($slug, OBJECT, get_post_types([], 'names'));
    return $page instanceof WP_Post ? (int) $page->ID : 0;
}

function tp_inventory_source_path(string $base, $key): string
{
    $segment = is_int($key) ? '[' . $key . ']' : '.' . (string) $key;
    return $base . $segment;
}

function tp_inventory_layout_scope(string $sourcePath): string
{
    if (preg_match('/\.acf\.sections_new\[\d+\]$/', $sourcePath)) {
        return 'page-top-level';
    }
    if (preg_match('/\.acf\.sections\[\d+\]$/', $sourcePath)) {
        return 'article-top-level';
    }

    return 'component';
}

function tp_inventory_reference_key(array $reference): string
{
    return implode('|', [
        (string) ($reference['kind'] ?? ''),
        (string) ($reference['intent'] ?? ''),
        (string) ($reference['legacyId'] ?? ''),
        (string) ($reference['taxonomy'] ?? ''),
        (string) ($reference['url'] ?? ''),
        (string) ($reference['sourcePath'] ?? ''),
    ]);
}

function tp_inventory_add_reference(array &$references, array $reference): void
{
    $references[tp_inventory_reference_key($reference)] = $reference;
}

function tp_inventory_link_candidate($value, string $sourcePath, string $origin): ?array
{
    if ($value instanceof WP_Post) {
        return [
            'origin' => $origin,
            'kind' => 'link',
            'sourcePath' => $sourcePath,
            'label' => html_entity_decode(get_the_title($value), ENT_QUOTES | ENT_HTML5, 'UTF-8'),
            'url' => tp_inventory_sanitize_url(get_permalink($value->ID)) ?: '',
            'target' => '',
            'postId' => (int) $value->ID,
            'menuBlockCount' => null,
        ];
    }

    if (!is_array($value)) {
        return null;
    }

    $looksLikeLink = array_key_exists('url', $value)
        && (
            array_key_exists('value', $value)
            || array_key_exists('target', $value)
            || array_key_exists('title', $value)
        )
        && !isset($value['mime_type'])
        && !isset($value['sizes']);
    if (!$looksLikeLink) {
        return null;
    }

    $url = tp_inventory_sanitize_url(is_string($value['url'] ?? null) ? $value['url'] : null);
    $rawValue = $value['value'] ?? null;
    $postId = is_numeric($rawValue) && get_post((int) $rawValue) instanceof WP_Post
        ? (int) $rawValue
        : tp_inventory_resolve_url_post_id($url);

    if ($url === null && $postId < 1) {
        return null;
    }

    return [
        'origin' => $origin,
        'kind' => 'link',
        'sourcePath' => $sourcePath,
        'label' => (string) ($value['title'] ?? $value['name'] ?? ''),
        'url' => $url ?: '',
        'target' => (string) ($value['target'] ?? ''),
        'postId' => $postId > 0 ? $postId : null,
        'menuBlockCount' => null,
    ];
}

function tp_inventory_collect_option_links(
    $value,
    string $sourcePath,
    string $origin,
    array &$candidates
): void {
    $candidate = tp_inventory_link_candidate($value, $sourcePath, $origin);
    if ($candidate !== null) {
        $candidates[] = $candidate;
        return;
    }

    if (!is_array($value)) {
        return;
    }

    foreach ($value as $key => $child) {
        tp_inventory_collect_option_links(
            $child,
            tp_inventory_source_path($sourcePath, $key),
            $origin,
            $candidates
        );
    }
}

function tp_inventory_collect_navigation_candidates($dropdown): array
{
    $rows = is_array($dropdown) ? array_values($dropdown) : [];
    $candidates = [];

    foreach ($rows as $index => $row) {
        if (!is_array($row)) {
            continue;
        }

        $menuBlocks = isset($row['menu_block']) && is_array($row['menu_block'])
            ? $row['menu_block']
            : [];
        $forPage = tp_inventory_sanitize_url(
            isset($row['for_page']) && is_string($row['for_page']) ? $row['for_page'] : null
        );
        if ($forPage !== null) {
            $candidates[] = [
                'origin' => 'navigation',
                'kind' => 'dropdown-root',
                'sourcePath' => 'options.dropdown[' . $index . '].for_page',
                'label' => (string) ($row['title'] ?? ''),
                'url' => $forPage,
                'target' => '',
                'postId' => ($resolved = tp_inventory_resolve_url_post_id($forPage)) > 0
                    ? $resolved
                    : null,
                'menuBlockCount' => count($menuBlocks),
            ];
        }

        tp_inventory_collect_option_links(
            $menuBlocks,
            'options.dropdown[' . $index . '].menu_block',
            'navigation',
            $candidates
        );
    }

    return $candidates;
}

function tp_inventory_collect_footer_candidates($footer): array
{
    $candidates = [];
    tp_inventory_collect_option_links($footer, 'options.footer_new', 'footer', $candidates);
    return $candidates;
}

function tp_inventory_scan_string(
    string $value,
    string $sourcePath,
    array &$references,
    array &$mediaIds
): void {
    if (preg_match_all('/wp-image-(\d+)/i', $value, $matches)) {
        foreach ($matches[1] as $rawId) {
            $mediaId = (int) $rawId;
            if ($mediaId < 1) {
                continue;
            }
            $mediaIds[$mediaId] = true;
            tp_inventory_add_reference($references, [
                'kind' => 'media',
                'intent' => 'dependency',
                'legacyId' => $mediaId,
                'taxonomy' => null,
                'url' => null,
                'sourcePath' => $sourcePath,
            ]);
        }
    }

    if (preg_match_all('/\b(?:href|src)\s*=\s*["\']([^"\']+)["\']/i', $value, $matches, PREG_SET_ORDER)) {
        foreach ($matches as $match) {
            $url = tp_inventory_sanitize_url($match[1]);
            if ($url === null) {
                continue;
            }
            $attribute = strtolower(substr($match[0], 0, 4));
            $intent = $attribute === 'href' ? 'link' : 'dependency';
            $attachmentId = $intent === 'dependency'
                ? (int) attachment_url_to_postid(str_starts_with($url, '/') ? home_url($url) : $url)
                : 0;
            if ($attachmentId > 0) {
                $mediaIds[$attachmentId] = true;
                tp_inventory_add_reference($references, [
                    'kind' => 'media',
                    'intent' => 'dependency',
                    'legacyId' => $attachmentId,
                    'taxonomy' => null,
                    'url' => $url,
                    'sourcePath' => $sourcePath,
                ]);
                continue;
            }

            tp_inventory_add_reference($references, [
                'kind' => 'url',
                'intent' => $intent,
                'legacyId' => null,
                'taxonomy' => null,
                'url' => $url,
                'sourcePath' => $sourcePath,
            ]);
        }
    }

    $tail = strtolower((string) preg_replace('/^.*[.\]]/', '', $sourcePath));
    if (
        in_array($tail, ['for_page', 'link', 'url', 'website'], true)
        && preg_match('#^(?:https?:)?//#i', $value)
    ) {
        $url = tp_inventory_sanitize_url($value);
        if ($url !== null) {
            tp_inventory_add_reference($references, [
                'kind' => 'url',
                'intent' => 'link',
                'legacyId' => null,
                'taxonomy' => null,
                'url' => $url,
                'sourcePath' => $sourcePath,
            ]);
        }
    }
}

function tp_inventory_listing_post_type($value): ?string
{
    if ($value instanceof WP_Post_Type) {
        return (string) $value->name;
    }
    if (is_object($value) && isset($value->name) && is_string($value->name)) {
        return $value->name;
    }
    if (is_array($value) && isset($value['name']) && is_string($value['name'])) {
        return $value['name'];
    }
    if (is_string($value) && preg_match('/^[a-z0-9_-]+$/', $value)) {
        return $value;
    }

    return null;
}

function tp_inventory_scan_value(
    $value,
    string $sourcePath,
    array &$references,
    array &$listingSelectors,
    array &$componentLayouts,
    array &$mediaIds,
    array &$termIds
): void {
    if ($value instanceof WP_Post) {
        $postId = (int) $value->ID;
        if ($value->post_type === 'attachment') {
            $mediaIds[$postId] = true;
            tp_inventory_add_reference($references, [
                'kind' => 'media',
                'intent' => 'dependency',
                'legacyId' => $postId,
                'taxonomy' => null,
                'url' => tp_inventory_sanitize_url(wp_get_attachment_url($postId) ?: null),
                'sourcePath' => $sourcePath,
            ]);
        } else {
            tp_inventory_add_reference($references, [
                'kind' => 'post',
                'intent' => 'dependency',
                'legacyId' => $postId,
                'taxonomy' => null,
                'url' => tp_inventory_sanitize_url(get_permalink($postId) ?: null),
                'sourcePath' => $sourcePath,
            ]);
        }
        return;
    }

    if ($value instanceof WP_Term) {
        $termId = (int) $value->term_id;
        $termIds[$value->taxonomy . ':' . $termId] = [
            'legacyId' => $termId,
            'taxonomy' => (string) $value->taxonomy,
        ];
        tp_inventory_add_reference($references, [
            'kind' => 'term',
            'intent' => 'dependency',
            'legacyId' => $termId,
            'taxonomy' => (string) $value->taxonomy,
            'url' => null,
            'sourcePath' => $sourcePath,
        ]);
        return;
    }

    if (is_string($value)) {
        tp_inventory_scan_string($value, $sourcePath, $references, $mediaIds);
        return;
    }

    if (!is_array($value)) {
        return;
    }

    $possibleMediaId = isset($value['ID']) && is_numeric($value['ID'])
        ? (int) $value['ID']
        : 0;
    if (
        $possibleMediaId > 0
        && get_post_type($possibleMediaId) === 'attachment'
        && (isset($value['mime_type']) || isset($value['sizes']) || isset($value['url']))
    ) {
        $mediaIds[$possibleMediaId] = true;
        tp_inventory_add_reference($references, [
            'kind' => 'media',
            'intent' => 'dependency',
            'legacyId' => $possibleMediaId,
            'taxonomy' => null,
            'url' => tp_inventory_sanitize_url(
                isset($value['url']) && is_string($value['url']) ? $value['url'] : null
            ),
            'sourcePath' => $sourcePath,
        ]);
        return;
    }

    $link = tp_inventory_link_candidate($value, $sourcePath, 'content');
    if ($link !== null) {
        if (is_int($link['postId']) && $link['postId'] > 0) {
            tp_inventory_add_reference($references, [
                'kind' => 'post',
                'intent' => 'link',
                'legacyId' => $link['postId'],
                'taxonomy' => null,
                'url' => $link['url'] !== '' ? $link['url'] : null,
                'sourcePath' => $sourcePath,
            ]);
        } elseif ($link['url'] !== '') {
            tp_inventory_add_reference($references, [
                'kind' => 'url',
                'intent' => 'link',
                'legacyId' => null,
                'taxonomy' => null,
                'url' => $link['url'],
                'sourcePath' => $sourcePath,
            ]);
        }
        return;
    }

    $layout = isset($value['acf_fc_layout']) && is_string($value['acf_fc_layout'])
        ? $value['acf_fc_layout']
        : '';
    if ($layout !== '') {
        $componentLayouts[$layout . '|' . $sourcePath] = [
            'layout' => $layout,
            'scope' => tp_inventory_layout_scope($sourcePath),
            'sourcePath' => $sourcePath,
        ];
        if ($layout === 'listing') {
            $listing = isset($value['listing']) && is_array($value['listing'])
                ? $value['listing']
                : [];
            $postType = tp_inventory_listing_post_type($listing['for'] ?? null);
            if ($postType !== null) {
                $listingSelectors[$postType . '|' . $sourcePath] = [
                    'postType' => $postType,
                    'sourcePath' => $sourcePath,
                ];
            }
        }
    }

    foreach ($value as $key => $child) {
        tp_inventory_scan_value(
            $child,
            tp_inventory_source_path($sourcePath, $key),
            $references,
            $listingSelectors,
            $componentLayouts,
            $mediaIds,
            $termIds
        );
    }
}

function tp_inventory_sort_records(array &$records, array $keys): void
{
    usort($records, static function (array $left, array $right) use ($keys): int {
        foreach ($keys as $key) {
            $comparison = ($left[$key] ?? null) <=> ($right[$key] ?? null);
            if ($comparison !== 0) {
                return $comparison;
            }
        }
        return 0;
    });
}

if (!function_exists('get_fields')) {
    fwrite(STDERR, "Advanced Custom Fields is not loaded.\n");
    exit(2);
}

$navigationField = getenv('TP_INVENTORY_NAVIGATION_FIELD') ?: 'dropdown';
$footerField = getenv('TP_INVENTORY_FOOTER_FIELD') ?: 'footer_new';
$statuses = array_values(array_filter(array_map(
    'trim',
    explode(',', (string) (getenv('TP_INVENTORY_STATUSES') ?: 'publish,private,draft'))
)));
$excludedPostTypes = array_fill_keys(array_values(array_filter(array_map(
    'trim',
    explode(',', (string) getenv('TP_INVENTORY_EXCLUDED_POST_TYPES'))
))), true);

$postTypes = array_values(array_filter(
    get_post_types([], 'names'),
    static fn(string $postType): bool => !isset($excludedPostTypes[$postType])
));
sort($postTypes);

$posts = get_posts([
    'post_type' => $postTypes,
    'post_status' => $statuses,
    'posts_per_page' => -1,
    'orderby' => 'ID',
    'order' => 'ASC',
    'no_found_rows' => true,
    'suppress_filters' => false,
]);

$mediaIds = [];
$termIds = [];
$nodes = [];

foreach ($posts as $post) {
    if (!$post instanceof WP_Post) {
        continue;
    }

    $references = [];
    $listingSelectors = [];
    $componentLayouts = [];
    $fields = get_fields($post->ID);
    if (!is_array($fields)) {
        $fields = [];
    }
    $template = (string) get_page_template_slug($post->ID);
    $sectionsNewTemplates = [
        'layouts/default-new.blade.php',
        'layouts/articles-list.blade.php',
        'layouts/learning-hub-home.blade.php',
        'layouts/market-matrix.blade.php',
        'layouts/cookie-consent.blade.php',
    ];
    $authoritativeField = 'all-acf-fields';
    $authoritativeValue = $fields;
    $scanPostContent = true;
    if ($post->post_type === 'post' || $template === 'layouts/article.blade.php') {
        $authoritativeField = 'sections';
        $authoritativeValue = $fields['sections'] ?? [];
        $scanPostContent = false;
    } elseif (in_array($template, $sectionsNewTemplates, true)) {
        $authoritativeField = 'sections_new';
        $authoritativeValue = $fields['sections_new'] ?? [];
        $scanPostContent = false;
    }
    tp_inventory_scan_value(
        $authoritativeValue,
        'posts.' . $post->ID . '.acf.' . $authoritativeField,
        $references,
        $listingSelectors,
        $componentLayouts,
        $mediaIds,
        $termIds
    );
    if ($scanPostContent) {
        tp_inventory_scan_string(
            (string) $post->post_content,
            'posts.' . $post->ID . '.content',
            $references,
            $mediaIds
        );
    }

    $featuredMediaId = (int) get_post_thumbnail_id($post->ID);
    if ($featuredMediaId > 0) {
        $mediaIds[$featuredMediaId] = true;
        tp_inventory_add_reference($references, [
            'kind' => 'media',
            'intent' => 'dependency',
            'legacyId' => $featuredMediaId,
            'taxonomy' => null,
            'url' => tp_inventory_sanitize_url(wp_get_attachment_url($featuredMediaId) ?: null),
            'sourcePath' => 'posts.' . $post->ID . '.featuredMedia',
        ]);
    }

    foreach (get_object_taxonomies($post->post_type) as $taxonomy) {
        $assigned = wp_get_object_terms($post->ID, $taxonomy);
        if (is_wp_error($assigned)) {
            continue;
        }
        foreach ($assigned as $term) {
            if (!$term instanceof WP_Term) {
                continue;
            }
            $termId = (int) $term->term_id;
            $termIds[$taxonomy . ':' . $termId] = [
                'legacyId' => $termId,
                'taxonomy' => (string) $taxonomy,
            ];
            tp_inventory_add_reference($references, [
                'kind' => 'term',
                'intent' => 'dependency',
                'legacyId' => $termId,
                'taxonomy' => (string) $taxonomy,
                'url' => null,
                'sourcePath' => 'posts.' . $post->ID . '.taxonomies.' . $taxonomy,
            ]);
        }
    }

    $references = array_values($references);
    $listingSelectors = array_values($listingSelectors);
    $componentLayouts = array_values($componentLayouts);
    tp_inventory_sort_records(
        $references,
        ['kind', 'intent', 'legacyId', 'taxonomy', 'url', 'sourcePath']
    );
    tp_inventory_sort_records($listingSelectors, ['postType', 'sourcePath']);
    tp_inventory_sort_records($componentLayouts, ['scope', 'layout', 'sourcePath']);

    $postTypeObject = get_post_type_object($post->post_type);
    $redirect = null;
    if ($post->post_type === 'redirect') {
        $redirect = [
            'from' => isset($fields['from']) && is_string($fields['from'])
                ? tp_inventory_path_for_url($fields['from'])
                : null,
            'to' => isset($fields['to']) && is_string($fields['to'])
                ? tp_inventory_sanitize_url($fields['to'])
                : null,
            'type' => isset($fields['type']) ? (string) $fields['type'] : '',
        ];
    }
    $nodes[] = [
        'legacyId' => (int) $post->ID,
        'postType' => (string) $post->post_type,
        'postTypePublic' => $postTypeObject instanceof WP_Post_Type
            ? (bool) is_post_type_viewable($postTypeObject)
            : false,
        'status' => (string) $post->post_status,
        'title' => html_entity_decode(get_the_title($post), ENT_QUOTES | ENT_HTML5, 'UTF-8'),
        'slug' => (string) $post->post_name,
        'path' => tp_inventory_post_path((int) $post->ID),
        'template' => $template,
        'authoritativeField' => $authoritativeField,
        'references' => $references,
        'listingSelectors' => $listingSelectors,
        'componentLayouts' => $componentLayouts,
        'redirect' => $redirect,
    ];
}

tp_inventory_sort_records($nodes, ['legacyId']);

$media = [];
ksort($mediaIds);
foreach (array_keys($mediaIds) as $mediaId) {
    if (get_post_type((int) $mediaId) !== 'attachment') {
        continue;
    }
    $relativePath = get_post_meta((int) $mediaId, '_wp_attached_file', true);
    $resolvedPath = get_attached_file((int) $mediaId);
    $media[] = [
        'legacyId' => (int) $mediaId,
        'title' => html_entity_decode(get_the_title((int) $mediaId), ENT_QUOTES | ENT_HTML5, 'UTF-8'),
        'mimeType' => (string) get_post_mime_type((int) $mediaId),
        'url' => tp_inventory_sanitize_url(wp_get_attachment_url((int) $mediaId) ?: null),
        'relativePath' => is_string($relativePath) && $relativePath !== '' ? $relativePath : null,
        'available' => is_string($resolvedPath) && $resolvedPath !== '' && is_readable($resolvedPath),
    ];
}

$terms = [];
ksort($termIds);
foreach ($termIds as $termReference) {
    $term = get_term((int) $termReference['legacyId'], (string) $termReference['taxonomy']);
    if (!$term instanceof WP_Term) {
        continue;
    }
    $terms[] = [
        'legacyId' => (int) $term->term_id,
        'taxonomy' => (string) $term->taxonomy,
        'name' => (string) $term->name,
        'slug' => (string) $term->slug,
    ];
}
tp_inventory_sort_records($terms, ['taxonomy', 'legacyId']);

$navigationCandidates = tp_inventory_collect_navigation_candidates(
    get_field($navigationField, 'option')
);
$footerCandidates = tp_inventory_collect_footer_candidates(get_field($footerField, 'option'));
tp_inventory_sort_records(
    $navigationCandidates,
    ['sourcePath', 'kind', 'postId', 'url', 'label']
);
tp_inventory_sort_records(
    $footerCandidates,
    ['sourcePath', 'kind', 'postId', 'url', 'label']
);

global $wpdb;
$snapshot = [
    'schemaVersion' => TP_INVENTORY_SCHEMA_VERSION,
    'source' => [
        'home' => (string) home_url('/'),
        'site' => (string) site_url('/'),
        'tablePrefix' => (string) $wpdb->prefix,
        'wordpressVersion' => (string) get_bloginfo('version'),
        'acfVersion' => defined('ACF_VERSION') ? (string) ACF_VERSION : 'unknown',
        'frontPageId' => (int) get_option('page_on_front'),
    ],
    'navigationCandidates' => $navigationCandidates,
    'footerCandidates' => $footerCandidates,
    'nodes' => $nodes,
    'media' => $media,
    'terms' => $terms,
];

$json = wp_json_encode($snapshot, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);
if ($json === false) {
    throw new RuntimeException('Could not encode production inventory snapshot.');
}

fwrite(STDOUT, $json . PHP_EOL);
