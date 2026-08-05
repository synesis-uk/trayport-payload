# Frontend route and component inventory

This inventory is the ownership map for the reachable frontend. It is based on the
current route dispatcher, `tests/helpers/site.ts`, the content views and block registry,
the global shell, the semantic icon registry, the shared token/global layers, and the
route-scoped parity stylesheets. Dormant
WordPress routes are not treated as implemented merely because they appear in the migration
manifest.

Status language is deliberately narrow:

- **Implemented** means the current React/data path exists and is exercised by focused tests.
- **Bridge** means the path is live but still depends on compatibility/parity CSS or an explicitly
  documented temporary presentation treatment.
- **Open** means the named visual or migration acceptance evidence does not yet pass.
- **Golden** identifies a tracked WordPress reference; it does not mean the candidate matches it.

The retained WordPress production inventory contains 296 public destinations: 51 WordPress page
identities, two virtual indexes, and 243 listing children. Target ownership splits those page
identities into 50 Payload Pages and one temporary Redirect. The table below groups the inventory by
18 content archetypes plus the temporary-redirect archetype and their React/runtime owners. The
named migration acceptance slice now contains 27 roots: 26 rendered content routes and the explicit
`/request-a-demo/` 302. The other 267 planned bodies remain content-migration work and must not be
treated as direct-navigation frontend acceptance merely because their route family has an
implementation owner.

## Route-to-view inventory

`src/app/(frontend)/page.tsx` and `[...segments]/page.tsx` both delegate to
`ContentRoute`. The route registry resolves the owning Payload record or virtual global,
and `ContentRoute` selects the view. Every rendered route shares the server-owned
`Header`, `Footer`, skip link, local Inter font, metadata, and optional preview bar from
the frontend layout.

| Reachable path or family | Route owner and archetype | React view and visible section sequence | Data and interaction owner | Evidence and current status |
| --- | --- | --- | --- | --- |
| `/` **Golden** | `pages`; `page.homepage` | `PageView` -> `TrayportBlocks`: image `trayportHero` with four stats; managed content sections; feature/stat/entity compositions; two market-volume charts and data disclosures; managed regional connection map; final actions/content | Payload page/layout; application PostgreSQL for quarterly market data; `MarketVolumeChart.client.tsx` owns Highcharts hydration; the server map model owns exact topology and a viewport-lazy Mapbox island activates only with approved runtime configuration | Representative route, visual fixture, content-feature and performance checks exist. **Bridge/Open:** typed dispatch and exact map topology are live; the fallback remains active without approved Mapbox configuration, route-scoped compatibility CSS remains, and the golden visual comparison is not accepted. |
| `/products/joule/` **Golden**; `/products/tradesignal/` | `pages`; `page.product` | `PageView` -> hero and product content sections, including headings/rich text, media, feature/entity/stat/action and FAQ presentations | Payload page/layout; native FAQ disclosures; managed media | Both product routes are representative. Joule has a golden fixture. **Bridge/Open:** shared block path is live; product parity selectors and golden comparison remain. |
| `/resources/insights/` **Golden**; `/resources/news/`; `/learning-hub/` | `pages`; `page.content-index` | `PageView` -> optional hero/content intro -> exactly one `articleListing` or `learningVideoListing`; Insights/News render featured cards, filters and result rows; Learning Hub renders filterable video cards | Listing block loads the complete compact card projection for the verified corpus; `ArticleListingClient` and `LearningVideoListingClient` own filter, empty and incremental states | Representative route and listing/interaction checks exist. Insights has a golden fixture. **Bridge/Open:** listing behavior is implemented; listing CSS and golden comparison remain. |
| `/company/about-us/`; `/company/offices/`; `/company/careers/`; `/resources/faqs/`; `/regions/europe/`; `/regions/asia-pacific/`; `/regions/north-america/`; `/contact/` | `pages`; `page.standard` | `PageView` -> imported hero or fallback page header -> content sections. Offices use structured `office` components; FAQs use disclosures; region pages can use the managed regional-connectivity map/feature components. Contact deliberately omits two dormant HubSpot form blocks while retaining support details and four offices | Payload page/layout and referenced office, person, reusable-content, region, hub, venue, Asset Class and media records; regional map blocks own their lazy Mapbox interaction and accessible data view | All named routes are in the 25-route rendered acceptance set. **Implemented behavior / Bridge styling:** Contact is a documented simplification and exact route-level visual acceptance remains open. |
| `/legal/`; `/legal/cookie-policy/`; `/terms-of-use-disclaimer/`; `/legal/legal-notice/`; `/legal/modern-slavery/` | `pages`; `page.legal` | `PageView` -> imported policy/article heading and managed rich-text/content-section body | Payload page/layout; Site Settings owns the managed cookie-notice relationship | All five are representative routes with source identity and rendered-route coverage. **Implemented behavior / Bridge styling.** |
| `/resources/market-matrix/` | `pages`; `page.interactive-market-matrix` | `PageView` -> imported hero/content -> exactly one managed `marketMatrix` block with Asset Class/Region/Hub filters, collapsible Venue groups, accessible data view, CSV, and formatted Excel export | Payload page/layout; Venue `marketConnections` is authoritative; hubs and classifications supply the derived read model | Representative route with migration cardinality, model, loader, export, and route coverage. **Implemented behavior / Bridge styling:** exact reference visual acceptance remains open. |
| Other page archetypes: `page.landing`, `page.conversion` | `pages`; route required when published | `PageView` -> fallback/managed hero -> allowed content sections | Payload page/layout | Supported by the route model and dispatcher, but no published content page of either archetype is accepted in this slice. `page.conversion` remains guarded until the bounded HubSpot integration exists. **Open:** do not infer rendered-content or visual acceptance. |
| `/insights/on-demand-webinar-data-analytics-for-energy-traders/`; `/event/e-world-2026/` | `articles`; `article.full` | `ArticleView` -> leading managed hero or article header -> date/type/location/byline metadata -> body blocks | Payload article/layout | Both are representative routes. **Bridge:** focused route coverage exists; presentation still uses shared legacy block renderers. |
| `/market-coverage/german-power/` **Golden** | `hubs`; `hub.public-page` | `HubView` -> optional leading hero -> structured stage/card: managed cover or map, classification, title tab, summary, `Connected Venues`, Joule and autoTRADER groups -> optional body blocks | Payload hub relationships, asset classes, regions, venues and media; view owns grouping/sorting | Representative route, relationship checks and golden fixture exist. **Bridge/Open:** structured view is typed; `parity-structured.css` and golden comparison remain. |
| `/venue/eex/` **Golden** | `venues`; `venue.public-detail` | `VenueView` -> optional leading hero -> structured card: type/title/logo identity, About, grouped Markets, Contact action -> optional body blocks | Payload venue-to-hub relationships, descriptions, logo and website; view owns grouping/sorting | Representative route, relationship/touch-target/performance checks and golden fixture exist. **Bridge/Open:** structured view is typed; `parity-structured.css` and golden comparison remain. |
| `/learning-hub-video/trading-in-joule/` | `learning-videos`; `learning-video.public-detail` | `LearningVideoView` -> leading/fallback detail hero -> public player or protected access gate -> facts -> optional description/body | Payload learning-video record; `TrayportVideo.client.tsx` only when playable browser media exists | Representative route plus canonical-alias and protected-gate checks exist. **Implemented behavior / Bridge styling.** |
| `/venue/` | virtual route claim; `index.venue` | `VenueIndexView` -> `IndexHero` -> connected-venue directory/list or empty state | `route-indexes` global plus compact `loadVenueIndex` server view model | Virtual-index route check exists. **Implemented behavior / Bridge styling.** |
| `/market-coverage/` | virtual route claim; `index.market-coverage` | `MarketCoverageIndexView` -> `IndexHero` -> managed coverage map -> route-backed hub directory/list or empty state | `route-indexes` global plus compact hub/marker loaders | Virtual-index, map-presence and route-backed-link checks exist. **Implemented behavior / Bridge styling.** |
| Managed aliases and path redirects, including `/request-a-demo/` -> `/contact/` | `redirects`; `redirect.temporary-contact` for the accepted WordPress page identity; registry owner `redirect` | No content view; `src/proxy.ts` preserves configured 301/302 semantics before page rendering | Route-registry and Redirects records | Request A Demo is explicitly accepted as a temporary 302, not a rendered conversion page; alias status/destination is exercised. **Implemented and reversible per redirect record.** |
| Unknown path | no route claim | shared `NotFoundView`: eyebrow, single heading, explanation and home action | Proxy published-route preflight plus Next.js global/route not-found boundaries | Unknown ordinary, file-like, and reserved-namespace child paths retain HTTP 404 status with the designed body; signed preview tokens are the only draft-route bypass. **Implemented behavior / Bridge styling.** |

Navigation and footer links use an explicit migration bridge. Links to the 27 accepted roots and the
two virtual indexes stay internal. The 34 unique same-site destinations whose bodies are still
plan-only resolve to canonical `https://www.trayport.com/` fallbacks: 29 leaf destinations plus the
five clickable section roots. Each fallback is isolated to its link value and can be reversed to an
internal path when that route enters a later acceptance slice; this closes navigation without
claiming direct-navigation content parity for those bodies.

The remaining archetype IDs are intentionally non-routable states, not missing page views:
`article.listing-metadata`, `learning-video.listing-metadata`, `hub.map-only`, and
`venue.structured-record` have a forbidden route policy and appear only inside listings,
maps, or relationships. A public destination is available only when a record has its routable
content mode/path or an explicit external destination.

## Golden-route acceptance matrix

This is the minimum route/section matrix for visual work. The tracked images live under
`tests/visual/reference`; current candidates must not replace them to make a failure disappear.

| Golden route | Shared shell | Route-specific acceptance surface | Primary React owners | Current acceptance |
| --- | --- | --- | --- | --- |
| Home | Header/mega navigation; footer; cookie state normalized for capture | Image hero/stats, section rhythm, charts, data disclosures, regional map, final content | `PageView`, typed block adapters/presentations, `MarketVolumeChart` | **Open** |
| Joule | Header/menus; footer | Image hero, proposition and feature hierarchy, media/surfaces, FAQ, final action | `PageView`, typed block adapters/presentations | **Open** |
| Insights | Header/search; footer | Hero, four featured records, search/category/year controls, result rows and empty state | `PageView`, `ArticleListingBlockAdapter`, `ArticleListingClient` | **Open** |
| German Power | Header/menus; footer | Pale-blue surround, cover/classification/title tab, connected-venue group hierarchy | `HubView`, `TrayportMedia`, shared block registry | **Open** |
| EEX | Header/menus; footer | Venue identity/logo, About content, market groups/links, contact action | `VenueView`, `TrayportMedia`, shared block registry | **Open** |

Cookie consent is persisted client state and the WordPress reference can contain a transient
banner. Visual capture must set the same cookie state on both sites or mask only that agreed
transient surface; it must not silently accept a shell-height mismatch.

### Reference footer and cookie inventory

The active WordPress Blade output, local option data, and tracked EEX desktop/mobile captures
establish this bounded shell contract:

- The desktop footer has 13 destinations: four company links, four market/region links, the
  linked `Legal` heading, and four legal links. Footer navigation is hidden below 48 rem.
- Link icons are the exact sharp-solid Font Awesome roles imported from `footer_new`; editors
  choose only the nine semantic icon names and four observed accent colors.
- The supporting row contains the legal disclaimer, `Connect with us:` plus LinkedIn/X, and
  `Head Office:` plus the UK address. The lower row contains two option-owned legal statements
  and `Copyright © {year} Trayport Limited`. No certification mark is active in the reference.
- The first-visit notice contains one aggregate choice: `Reject All` or `Accept All`. It does
  not expose the WordPress plugin's dormant category/preference architecture. The choice is
  stored for 365 days; the mobile visual order puts Accept before Reject.
- `/legal/cookie-policy/` is imported from WordPress page 7589 and the cookie notice now owns a
  managed `policyPage` relationship. The validated `policyURL` remains as a reversible fallback.

## Shared component pattern matrix

| Pattern | Public API or render owner | Current consumers | State |
| --- | --- | --- | --- |
| Global shell | `Header/Component.tsx`, focused desktop/mobile/search clients, thin `Footer/Component.tsx` adapter, typed footer presentation pieces, temporary `CookieNotice.tsx` bridge | Every frontend route | Payload adapters and interactive boundaries are implemented. Footer content/behavior contracts now match the active reference; CookieYes integration and final route-level pixel acceptance remain **open**. |
| Route dispatch | `ContentRoute`, content route registry, `components/content/*` | All routable collections and both virtual indexes | Typed kind-to-view selection and published/draft cache split are implemented. |
| Top-level CMS blocks | `components/blocks/registry.tsx`: hero, content section, article listing, learning-video listing | Pages plus full article/hub/venue/learning detail bodies | Compile-time exhaustive, generated-type-backed registry with separate normalizers and presentation models. **Implemented.** |
| Content-section components | heading, rich text, actions, media, feature list, statistics, FAQ, checklist, lifecycle, entity list, timeline, data table, gallery, divider, market coverage, embed, data chart and office adapters | Columns inside `contentSection` | Every current Payload union member has a typed adapter and explicit presentation model. **Implemented; route styling acceptance remains separate.** |
| Layout compositions | `Container`, `Section`, `Stack`, `Cluster`, `Grid` | Design-system gallery, shell, typed block presentations, and content views | Typed/CVA APIs exist; remaining BEM classes are scoped compatibility or specialist styling rather than a monolithic renderer. |
| Typography/actions | `Eyebrow`, `HeadingGroup`, `AppLink`, `ActionLink`, `ActionGroup` | Gallery, shell and selected route compositions | Implemented foundation; production adoption is partial. |
| Marketing compositions | `Hero`, `MediaBlock`, `IconText`, `LogoCloud`, `CTASection`, `StatGrid`, `Surface` | Gallery and typed presentation paths | Implemented and gallery-visible; adoption is deliberate where the imported layout has the matching semantic shape. |
| Interaction primitives | Button/ButtonLink/IconButton, Input/Textarea, Label/FormField, Checkbox, Select, Dialog, Popover, DropdownMenu, Accordion/Disclosure, Pagination, Card | Gallery, site search, selected components | Normalized primitive layer exists. Legacy native controls/disclosures remain valid until each consumer is deliberately migrated; existence is not route adoption. |
| Managed links/media | `AppLink`, `TrayportMedia` server boundary, small client video player | Shell, blocks, listings, structured views | Internal/external routing and optimized image boundary are implemented. |
| Listings/cards/filters | `ArticleListingClient`, `LearningVideoListingClient` plus compact server selects | Insights, News, Learning Hub | Behavior is implemented; reusable card/filter extraction and CSS migration remain. |
| Specialist data visualization | `DataChartPresentation`, `MarketVolumeChart.client.tsx`, `MarketCoveragePresentation`, `DynamicConnectionsMap.client.tsx`, `DynamicRegionalMarketMap.client.tsx`, `HubView`, and `IndexViews` | Charts, global schematic, regional maps, Hub fallback map, coverage index | Deliberate specialist boundary. Highcharts loads through one same-origin runtime. The global schematic retains a typed SVG/managed-media fallback; regional maps viewport-lazy-load pinned Mapbox from application/Payload-owned data and retain an accessible data view. |
| Development evidence | guarded, database-free `/design-system/`; golden-route Playwright project | Component variants and five golden routes | Gallery/fixtures exist. Full route visual acceptance remains **open**. |

## React, data, interaction, and CSS ownership

| Concern | React/presentation owner | Data owner | Browser-state owner | CSS owner today |
| --- | --- | --- | --- | --- |
| Header/navigation/search | `Header/*` | cached Navigation and Site Settings globals | desktop dropdown, mobile drawer and Radix search dialog clients | `parity-shell.css` overrides older shell recipes in `globals.css` |
| Footer/cookie notice | thin `Footer/Component.tsx` adapter plus `FooterPresentation`, brand, navigation, supporting and legal pieces | cached Footer and Site Settings globals populated by the WP importer; CookieYes remains the target provider | temporary `CookieNotice` aggregate accept/reject bridge; deferred CookieYes Next.js integration will own production categories/preferences | `parity-shell.css` plus older superseded footer/cookie recipes in `globals.css` |
| Page/article bodies | `PageArticleViews`, block registry, typed adapters, normalizers, and presentations | Payload page/article documents | listing/filter/chart/video clients only where mounted | `parity-blocks.css` plus the shared-content, listing and article sections of `globals.css` |
| Hub/venue detail | `HubView`, `VenueView` | Payload relationships and managed media | none for the base views | `parity-structured.css` plus structured/detail recipes in `globals.css` |
| Virtual indexes | `IndexViews` | Route Indexes global and compact cached server loaders | none | index/map recipes in `globals.css`; shared structured colors/tokens |
| UI primitives/compositions | `components/ui`, `components/site` | typed props only | Radix/native primitive modules as needed | colocated Tailwind utilities backed by `tokens.css`; some compatibility BEM hooks remain by design |
| Charts | server `DataChart` wrapper plus `MarketVolumeChart.client` | application PostgreSQL, outside Payload | Highcharts lifecycle/failure state; native table disclosure | chart rules in `parity-blocks.css` and `globals.css`; series configuration in the chart module |
| Maps | server `MarketCoveragePresentation`; `DynamicConnectionsMap.client`/`ConnectionsMapRuntime.client`; `DynamicRegionalMarketMap.client`/`RegionalMarketMapRuntime.client`; `HubView`; `IndexViews` | Payload Region geometry/points, Hub coordinates/countries/types/routes, Venue hierarchy, Asset Class appearance/keys, bounded presentation controls; server-only validated provider configuration | Global schematic autoplay/filter/fallback plus regional region/reset, Asset Class, country/Hub/route/point, sidebar, and period state; Mapbox lifecycle/readiness/error behavior only when approved configuration exists | map rules in parity/shared CSS; deterministic SVG/data fallbacks plus application-derived Mapbox sources/layers in owning runtimes |
| Rich text/media | `RichText`, `TrayportMedia` | Payload Lexical/media documents | video playback/reduced-motion client only | readable prose/media recipes in `globals.css`; composition sizing in React |

Server components remain the default. The intentional client boundaries are navigation/search,
cookie persistence, article and learning filters, Radix interactive primitives, Highcharts,
route-owned viewport-lazy Mapbox runtimes, video playback, preview/admin helpers, and no broader
route wrapper.

## Responsive and interactive state matrix

The shared token breakpoints are `sm` 40rem, `md` 48rem, `lg` 64rem, `xl` 80rem and
`2xl` 96rem. The mobile/desktop shell switch is at 64rem; 80/96rem currently adjust only
reference-led shell gutters.

| Surface | Compact/mobile state | Wide/desktop state | Keyboard, focus and non-happy states | Evidence/status |
| --- | --- | --- | --- | --- |
| Primary navigation | Below 64rem: menu button opens a fixed, scrollable full-height panel; body scroll is locked | From 64rem: horizontal roots and full-width dropdown panels; open by click or hover; outside pointer closes | Buttons expose `aria-expanded`/`aria-controls`; Escape closes; mobile restores trigger focus. The current mobile drawer is not documented as a focus trap | Desktop/mobile navigation and axe checks exist; visual parity **open** |
| Site search | Search trigger is hidden by current parity CSS below 64rem | Trigger opens a Radix modal panel | Initial focus moves to field; Tab is contained; Escape closes and restores trigger; submit forwards `q` to Insights | Interaction/axe checks exist; whole-site search is explicitly not claimed |
| Hero/section/grid | Single-column flow, reduced type/spacing and media heights | Token/CVA grids expand at 40/48/64rem; hero and section compositions use bounded widths | Media may be absent; `MediaBlock` has an explicit missing state; motion is disabled under reduced-motion | Gallery covers composition states; route parity **open** |
| Insights listing | Cards/rows and controls reflow without document overflow | Featured grid plus compact result rows and aligned filters | Search/category/year update an `aria-live` list; featured items hide while filtering; explicit empty state; load-more appears only when needed | Content, interaction and mobile-overflow checks exist |
| Learning listing | Cards and native selects stack/reflow | Multi-column video grid and aligned filters | Product/topic filters reset the visible window; `aria-live` results; protected, external, non-routable and empty states | Content and interaction checks exist |
| FAQ/disclosure | Full-width native `details` rows | Same semantics with wider answer layout/media | Enter/Space toggles native summary. The generic Radix Accordion/Disclosure exists but the current CMS FAQ renderer still uses native `details` | Behavior is live; consumer migration optional, visual parity **open** |
| Chart | Highcharts 12.2 uses the source-equivalent automatic layout with no explicit <=520 px responsive override; the table region can scroll independently | Full stacked-column chart with source-equivalent legend, axes, construction timing, and escaped HTML tooltip | Same-origin runtime-load failure exposes a status message; native “View chart data” disclosure reveals a semantic table without replacing the chart; reduced-motion animations are disabled | Accessibility/performance checks exist; chart geometry and tooltip parity are implemented while exact whole-route visual parity remains **open** |
| Data table | Bounded horizontal scrolling region | Natural table width within section | Region is labelled and keyboard-focusable; headers retain table semantics | Implemented behavior |
| Structured hub/venue | Card/groups collapse without document overflow; market links retain touch height | Media/identity and relationship groups use expanded layouts | Missing hub media falls back to labelled SVG map; missing relationships expose managed empty copy | Route/content/mobile checks exist; golden visual parity **open** |
| Virtual maps | SVG scales inside its figure/list stack | Map and explanatory copy share a grid | SVG has title/description; list remains the navigable representation; no hover-only information is required | Implemented bounded map; exact future topology is separate |
| Cookie notice | Fixed full-width notice; Accept is visually first, then Reject | Message and actions share a row; Reject precedes Accept as in the reference | Accept/reject are distinct versioned decisions with 365-day expiry; local storage synchronizes tabs and `data-cookie-consent`/a custom event expose the aggregate decision without inventing categories | Focused behavior/import tests pass; route-level transient visual comparison remains open |
| Primitive states | Controls remain at least the shared control/touch height and use mobile-safe text sizes | Same APIs; popovers/menus/selects are portalled and layered by tokens | Default, hover, focus-visible, active, disabled, loading and error states; reduced-motion alternatives; form help/error IDs | Gallery and focused UI/axe checks exist; production adoption is partial |

## Font Awesome semantic mapping

All interface code imports `AppIcon`; only `components/icons/registry.ts` imports Font Awesome
definitions. ESLint rejects direct Font Awesome imports elsewhere and rejects competing icon
systems. CMS feature icons are restricted to the five values in `featureIconNames`.

| Legacy/interface role | Semantic key -> Font Awesome definition | Current use |
| --- | --- | --- |
| Forward/internal action | `arrowRight` -> classic solid `faArrowRight` | Actions, cards, embeds, index and relationship links |
| Back/forward pagination | `chevronLeft` -> classic solid `faChevronLeft`; `chevronRight` -> `faChevronRight` | Pagination |
| Expand/collapse/scroll | `chevronDown` -> sharp-duotone light `faAngleDown`; `chevronUp` -> classic solid `faChevronUp` | Navigation, Select, Accordion/Disclosure |
| Global navigation controls | `menu` -> classic solid `faBars`; `close` -> `faXmark`; `more` -> `faEllipsis` | Mobile menu, dialogs and generic overflow affordance |
| Search | `search` -> sharp regular `faMagnifyingGlass`; `searchInsight` -> `faMagnifyingGlassChart` | Header/search/list rows and gallery/context-specific search |
| Selected/success/busy | `check` -> classic solid `faCheck`; `spinner` -> `faSpinnerThird` | Checkbox/menu/select indicators; button loading state |
| External destination | `externalLink` -> sharp-duotone solid `faArrowUpRightFromSquare` | Article/video/venue/hub links |
| Contact/location/access | `email` -> classic solid `faEnvelope`; `phone` -> `faPhone`; `location` -> sharp-duotone solid `faLocationDot`; `lock` -> `faLockKeyhole` | Offices, maps/classification, protected learning content |
| Playback/media | `play` -> classic solid `faPlay`; `pause` -> `faPause`; `playCircle` -> `faCirclePlay`; `image` -> `faImage` | Video controls/destinations and missing-media state |
| Bounded feature vocabulary | `lightbulb` -> classic light `faLightbulb`; `trend` -> `faArrowTrendUp`; `clock` -> `faClock`; `chart` -> `faChartMixed`; `chartLine` -> `faChartLine`; `scan` -> `faScanner` | Imported feature cards and site compositions |
| Footer destination vocabulary | `companyProfile`, `offices`, `careers`, `contact`, `marketMatrix`, `regionEurope`, `regionNorthAmerica`, `regionAsiaPacific`, `legalDocument` -> exact sharp-solid definitions | The 12 linked footer items; the linked Legal heading has no icon |
| Social brands | `linkedin` -> brands `faLinkedin`; `x` -> brands `faXTwitter` | Footer social links |

Explicit exceptions are content or geometry, not a second icon system:

- The Trayport/TMX mark remains the source-owned logo SVG; venue/client logos and
  certification marks remain managed brand media.
- Highcharts series, axes, legends and plotted markers are data visualization, not
  interface icons.
- Managed map imagery and typed SVG land/grid/route/marker geometry remain specialist map
  rendering. A location affordance in ordinary UI still uses `AppIcon`.
- Hero polygons, rules and the footer signature are decorative CSS geometry.
- Arbitrary Font Awesome names are not exposed to Payload editors.

## CSS classification and retirement gates

| Source | Classification | What it owns now | Retirement rule |
| --- | --- | --- | --- |
| `src/styles/tokens.css` | **Durable system source** | CSS-first Tailwind breakpoints, typography, spacing, containers, radii, elevation, motion, focus, layer, semantic brand/state/chart/map colors; compatibility aliases | Keep semantic tokens. Remove an alias only after `rg` proves no compatibility consumer and all affected screenshots/tests pass. |
| colocated utilities in `components/ui` and `components/site` | **Durable component source** | Primitive and reusable composition variants/states | Retain; canonicalize after componentization. Do not move reusable variants back into global route selectors. |
| `globals.css` base/reset/accessibility/container rules | **Durable global source** | document defaults, font/focus/selection, skip link, shared container and truly global rich-text semantics | Retain only rules that are global by meaning. Replace duplicated component recipes after all consumers move. |
| `globals.css` shell, block, listing, article, detail, index and structured recipes | **Mixed compatibility source** | Original BEM presentations still consumed by current React | Retire family-by-family after the owning React family uses tokens/compositions and parity/interaction evidence passes. Do not call the file as a whole “legacy” while active owners remain. |
| `parity-shell.css` | **Temporary reversible bridge** | WordPress-led header, desktop dropdown, mobile drawer, search, footer and cookie geometry; overrides older global recipes | Remove selector groups only after Header/Footer production markup is on the final shell components and every desktop/mobile/open/closed/focus state matches or has a logged approved improvement. |
| `parity-blocks.css` | **Temporary reversible bridge** | hero/section presentation, route-specific Home and Insights rules, charts/maps and product refinements | Home document-order selectors have been replaced by bounded component-type and presentation classes. Retire remaining page-family overrides only after both affected golden routes and interaction checks pass. |
| `parity-structured.css` | **Temporary structured-route bridge** | hub and venue stage/card/relationship presentation | Remove only when Hub/Venue owners express the final treatment and both German Power and EEX pass desktop/mobile golden checks. |
| Chart, rich-text, managed-media and map geometry rules | **Eligible specialist CSS** | Third-party chart DOM, authored prose, media fit and geometry that is clearer outside utility strings | May remain, but must be scoped to one owning component/family, token-backed, and free of route-order assumptions. |
| `src/app/(payload)/custom.scss` | **Separate admin source** | Payload admin only | Outside public frontend retirement work. |

A compatibility selector is removable only when all of these are true:

1. Its React owner and all consumers are identified; no CMS/importer value relies on the
   old class as an undocumented presentation API.
2. The replacement uses a typed semantic prop, component variant, or specialist owner—not
   another route path or child-order selector.
3. `rg` finds no remaining runtime/test reference that needs the selector, and the old rule
   is deleted rather than merely overridden by a higher-specificity duplicate.
4. Desktop and mobile screenshots pass for every affected golden route, including long/short
   content and missing-media cases represented in the gallery.
5. Hover, focus, keyboard, open/closed, loading, empty/error and reduced-motion states pass
   where applicable, along with typecheck, lint, focused UI/integration tests, build and E2E.
6. Any intentional visible improvement is recorded in the improvement ledger with an isolated
   hook and rollback before the parity rule is removed.

The former highest-risk Home document-position styling has been replaced with bounded
component-type and presentation classes, so section reordering no longer changes those treatments.
The remaining parity debt is route-family specificity and duplicated compatibility recipes; retire
it only after each affected desktop/mobile golden route is accepted.
