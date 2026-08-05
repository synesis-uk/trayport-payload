# Whole-site search contract

## Public behavior

The global header and result form submit `s` to `/?s=<query>`, preserving the
live WordPress search URL. The homepage route detects the parameter and renders
the dedicated search experience instead of the homepage document. Search result
responses are marked `noindex,follow` and do not create a second routable CMS
document.

Queries are normalized with Unicode-aware case and diacritic folding. They must
contain 2–100 characters. Repeated query parameters use the first value, invalid
page values fall back to page 1, and results are paged at 10 per response.

## Corpus

`src/search/publicSearchSources.server.ts` is the source adapter registry. It
currently includes every public route-owner collection:

- Pages
- Articles, including Insight, News and Event classifications
- People
- Hubs with a public page
- Venues with a public detail page
- Learning videos with a managed detail page

Each adapter makes one bounded Local API query with `depth: 0`,
`overrideAccess: false`, an explicit field select, published status and the
collection's routable content-mode condition. Documents without a canonical
path and documents whose SEO configuration is `noIndex` are excluded. Payload
field access still applies; search does not expose private relationships,
managed assets, destinations, drafts or restricted learning-video fields.

Visible copy is projected into a common document containing only the title,
canonical path, public type label, excerpt and searchable body. Structured
content extraction accepts visitor-facing headings, labels, captions, table
text and Lexical text nodes while ignoring URLs, relationship IDs, presentation
enums and CMS metadata.

People illustrates the extension contract: a future route-owner collection adds
one adapter with a public query and projection, then inherits the same cache,
ranking, pagination and result UI.

## Relevance and excerpts

Ranking follows the useful parts of the Relevanssi baseline:

- OR matching keeps a result when any term matches.
- Exact phrase matches receive the largest boost.
- Title matches rank above excerpt matches, which rank above body matches.
- Documents covering every query term receive an additional boost.
- Terms of three or more characters support word-prefix and word-suffix matches;
  matches inside an unrelated word are rejected.
- Equal scores are ordered by title and canonical path for deterministic output.

The excerpt starts near the first matched term and is bounded to 30 words and
280 characters. Matching text is highlighted with semantic `mark` elements in
the result title and excerpt.

## Cache and migration behavior

The server caches one normalized public corpus, not request-specific result
pages. It is refreshed after five minutes and expires after one hour. Each
adapter registers the existing `content-dependency-collection:<collection>`
tag. Routable collection publish, unpublish, path, body and delete hooks already
invalidate those tags, so no separate indexing worker or eventually consistent
search table is required.

The migration pipeline already loads the same routable title, summary, rich-text
and layout fields consumed by the adapters. Imported content therefore becomes
searchable on publication without a search-specific migration step or backfill.

## Verification

- `tests/int/site-search.int.spec.ts` covers validation, fuzzy boundaries,
  relevance, full-body search, excerpts, pagination, adapter coverage, public
  access options and cache-tag wiring.
- `tests/ui/site-search.ui.spec.tsx` covers the accessible form, result context,
  internal links, validation and empty state.
- `tests/e2e/interaction-accessibility.e2e.spec.ts` retains the modal focus trap
  and focus restoration contract.
- `tests/e2e/content-features.e2e.spec.ts` follows a header submission through to
  whole-site results.
