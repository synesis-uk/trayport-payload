# Market map parity matrix

## Authority and method

This is the exit artifact for slice A2 of the [remaining plan](../remaining-plan.md). It converts
the earlier judgement that the migrated maps are "at functional parity with a stronger data model"
into a checked record, one row per capability and per data entity.

Method: two independent inventories were taken of the live WordPress maps and the migrated maps —
neither anchored to the other — plus independent inventories of both databases. Those were
cross-referenced into the matrices below, and the result was then adversarially re-tested by
separate reviewers whose brief was to find rows wrongly graded as parity. Both reviewers returned
`holds=false`. Their re-grades are applied below and marked `†`; the section
[Corrections applied](#corrections-applied) records what changed and why.

Evidence was taken from both running sites, not from source reading alone: the live baseline at
`http://127.0.0.1:3090` and the migrated build at `http://127.0.0.1:3004`.

Verdicts: `present` means the user-visible outcome is equivalent. `improvement` means deliberately
better and defensible in one sentence a client would accept. `deviation` means it differs and needs
a decision. `missing` means absent. `unverified` means it could not be established — it is not a
soft pass.

## Headline

The underlying data migrated faithfully. All 62 marker coordinates match at full float precision,
all three region polygons are byte-identical, all 8 hub-to-hub routes match vertex-for-vertex, the
venue→hub edge set is identical once two duplicate legacy rows are discounted, and market-data
values reconcile hub-by-hub (TTF: 20,403.01 TWh, +11.2% QoQ on both). Every count difference found
was explained.

The rendering does not match. The migrated maps carry the right data and paint the wrong picture.

## Blocking defects

These are class 1 under the [change policy](../remaining-plan.md#change-policy) — the current build
is worse than the live site, so they need no approval, only fixing. All were reproduced directly.

1. **First paint is empty and wrongly tinted.** On a fresh load of `/resources/markets-map/` and
   `/regions/europe/`, the map renders with the entire world tinted and zero hub markers, routes,
   route markers, POIs or region labels, at world zoom rather than fitted. The accessible status
   line correctly reads "Showing 26 hubs for Power across all regions" while the map shows none of
   them. `/regions/asia-pacific/` paints correctly, so this is not universal.
2. **The map click path into the sidebar is dead.** The region-boundary fill handler runs last and
   clears the selection, so clicking a hub marker only changes the region. 20 of 22 hub markers at
   world view and 0 of 10 with a region selected opened the sidebar; 0 of 3 country clicks worked.
   Only route markers, the one hub outside every boundary, and the DOM list buttons still work.
3. **The control panel is invisible.** Region, Asset class, Data interval and Period render white
   text on white — computed `color` and `background-color` are both `rgb(255, 255, 255)`.
4. **Coordinate-less hubs plot at [0, 0].** `Number(null) === 0` in `src/data/regionalMarketMap.ts`
   coerces hubs with no marker location to the Gulf of Guinea: seven labelled markers off West
   Africa on `/resources/markets-map/`, one on `/regions/north-america/`. Legacy draws none of them.
5. **Hub and venue links leave the site.** 56 of 57 hubs point at absolute `www.trayport.com` URLs
   and venues at third-party sites. `/market-coverage/api2/` and `/venue/abaxx/` both 404 locally
   against 200 on the live site, and the market-coverage directory is down from 73 hub links to 1.

Defect 5 is a symptom of Track B rather than of the map: those routes are the unpromoted `map-only`
and `relationship-only` records. It resolves when their families are promoted, and should not be
patched at the map layer.

## Decisions needed

These are class 3 — visible differences that need an explicit yes or no before A3.

- **Hub marker hierarchy was flattened.** Legacy draws 100px named bubbles for regional and
  offshore hubs and 7px dots for venue/physical hubs, promoting the dots to text labels once a
  region is selected. The migration draws 7–8px dots for everything and labels every hub at world
  zoom. This is the largest single visual difference.
- **Region boundaries are now visible.** Legacy renders the same GeoJSON at zero fill opacity and
  zero outline width — deliberately invisible. The migration draws them as yellow circles.
- **Country highlighting is weaker.** Legacy fills connected countries with solid `#009CDE`; the
  migration uses a 42% wash. Selected-country fill dropped from opacity 1 to 0.72.
- **Default asset class changed on region pages**, Power → Natural Gas. On Asia Pacific this
  changes the entire default view.
- **Route lines and markers changed** from orange 2px with 32px yellow ship glyphs to translucent
  blue 4px with 7px orange dots.
- **Controls moved** from a hover-opening overlay inside the map's top-left corner to a click-opening
  bar above the map. The page copy still reads "Use the menu tool in the top left corner to assist
  your search."
- **Fit padding is no longer editor-controlled**, making every view ~0.3 zoom levels tighter than
  the live site.

## Genuine improvements retained

The migration fixes three real legacy defects: the dead route-line click (legacy throws
`e.stopPropagation is not a function`), a selection highlight that legacy draws underneath its own
country layer and so never shows, and market data being silently suppressed on touch devices. It
also adds an accessibility layer the live site has none of — keyboard-operable controls, an
`aria-live` status line, and a text hub/venue list — and models venue→asset-class as a real
relationship whose 133 pairs were independently re-derived and confirmed.

## Capability matrix

| Capability | Live site | Migrated | Verdict |
| --- | --- | --- | --- |
| Commodities-report embedded markets-map instances (cr-gas / cr-power / cr-coal / cr-emissi | Four partials each embed partials.markets-map pinned to Europe plus one asset class, with force_resize, marker_padding 50 and zoom_duration 5. | No commodities-report content or route exists at all. | `missing` |
| Hub detail page location map (for hubs with no hero image) | single-hub.blade.php falls back to a 350px #hub-map: non-interactive Mapbox, red dots per marker location, white opaque fills over the hub's own and connected countries, fitted on idle. 8 of 72 hubs lack an image and show it — e.g | HubView has an equivalent non-Mapbox SVG location schematic, but it is unreachable: only one hub page is published (German Power) and it has a hero image, so the schematic never renders. Every other hub URL 404s. | `missing` |
| Permanent region name labels drawn on the map | Every region with a latlng gets a permanent 'region-marker' popup showing its map_label — 'Asia Pacific', 'Europe', 'North America & Canada' — removed on region select and re-added by reset. | No permanent region labels anywhere. Region names appear only while the pointer is over the region polygon. | `missing` |
| Region-card mini-maps at the foot of each region page ('See Connectivity in other regions' | One 16:9 non-interactive Mapbox card per other region, fitted to that region's GeoJSON bounds over a 2000ms ease, with a centred primary-coloured pill carrying the region title and an arrow icon, the whole card linking to that reg | The same heading and the same two links, but no map at all — plain text cards reading 'North America / Explore North America' and 'Asia Pacific / Explore Asia Pacific'. | `missing` |
| Route hover highlighting † | Hovering a shipping route recolours it #F56A00 and thickens it to 2px. | Hover sets the cursor and opens a popup only; no colour or width change exists in the runtime. | `missing` |
| map-hubs cycling hub-data map (500px interactive-then-locked map with auto-cycling popups  | components/element/map-hubs.blade.php: 40px circle markers with wrapped labels, animated value popups, fit to all markers, 5s auto-cycle, prev/next chevrons (handlers swapped), and a hover-linked side list. Reachable only from the | No equivalent component or route. | `missing` |
| Behaviour when hub or region data is absent † | Silent skips throughout: hubs with an empty marker_locations array render no marker (only 4 markers for 8 Bulk hubs), non-numeric coordinates are skipped, country_code 'NONE' produces no highlight, a class with no ISO codes gets n | Same silent-skip behaviour: 9 Bulk hubs yield 4 markers (API2, API4, Dry Freight, gC NEWC), hubs with a blank country code contribute no tint, and connections without geometry fall back to a straight line. | `deviation` |
| CURRENT ONLY — asset-class filter buttons and autoplay on the global schematic | The equivalent code exists (per-class toggle buttons and a 5s slideshow) but show_toggle is off on the live homepage, so no buttons render and the slideshow never starts — all classes stay visible at once. | Where showAssetClassFilter is on (region pages, exchange-connectivity) an overlay button group with colour swatches and aria-pressed toggles one class at a time, and autoplay advances it on a timer until the user clicks. | `deviation` |
| CURRENT ONLY — first paint renders an empty, wrongly-tinted map | n/a (legacy renders correctly on first paint: 35 markers, correct country highlighting, region labels). | On every fresh load the hub, route, route-marker and POI sources stay empty and both country filters stay unset, so the map shows every country in the world tinted and no markers, labels, routes or POIs. Any subsequent control cha | `deviation` |
| CURRENT ONLY — global connections schematic added to region pages, About Us and Exchange C | The connections schematic appears only on the homepage. Legacy region pages carry 'Venue Connectivity' and 'Trading Counterparties' as text and venue-list sections with no map. | Each region page renders two additional 300px globalConnections maps under 'Venue Connectivity' and 'Trading Counterparties'; /company/about-us/ (light style) and /products/exchange-connectivity/ carry one each. | `deviation` |
| CURRENT ONLY — hub and venue links fall back to external trayport.com URLs | Every hub links to a local /market-coverage/{slug}/ permalink and every venue to /venue/{slug}/. | Only German Power resolves internally; the other 71 hubs link out to https://www.trayport.com/market-coverage/<slug>/, and many venues link to third-party sites. | `deviation` |
| CURRENT ONLY — map control panel text is invisible | n/a (legacy renders white control text on a black/50 chip overlaid on the map's top-left corner, fully legible). | The Region / Asset class / Data interval / Period field labels AND their selected values are white text on a white background, so the control bar reads as four empty boxes with chevrons. | `deviation` |
| CURRENT ONLY — region boundaries drawn as visible yellow circles | Legacy renders the same region GeoJSON but with fill opacity 0 and outline width 0, so region boundaries are invisible on the map. | Region boundaries render as a faint yellow fill (#f7ea48 @0.04) with a 1.5px yellow outline at 0.7 opacity — and because the stored geometry is a circle, the map shows large yellow circles over Europe, North America and Asia Pacif | `deviation` |
| Country (ISO) highlighting per asset class † | Flat #009CDE at opacity 1 with a #0057B8 outline over country_code + connected_locations for every non-ohub hub of the active class. Bulk highlights nothing because all six Bulk hubs carry country_code 'NONE'. | #009cde at 0.42 opacity with a #0057b8 outline over the same union (countryCode + connectedCountryCodes). Bulk highlights Australia only. | `deviation` |
| Country click opens the merged sidebar for that country | Clicking a highlighted country collects every hub whose country_code or connected_locations match and opens a merged sidebar (Luxembourg -> Belgian Power). Clicking an unhighlighted country does nothing. | No country click on the map produces a sidebar — the region fill intercepts it. The equivalent is only available as a DOM button in the accessible list, and only for countries with more than one hub. | `deviation` |
| Default asset class on region landing pages † | All three region pages open on Power. | All three open on Natural Gas. On Asia Pacific the entire default view changes from Japanese/Singapore Power to Australian Gas + LNG Asia. | `deviation` |
| Editorial configuration surface for a map placement | ACF per placement: regions, asset_classes, venue_types, commsrep_data, data_display, height, zoom_to, show_sidebar, show_options, show_fullscreen, marker_padding (100 live), zoom_duration (500 live), map_style, force_resize, conne | Payload block: mode, style, backgroundMedia, height, markerSize, showLines, lineColor/Width/Opacity, presentation, defaultAssetClass, showAssetClassFilter, autoplayAssetClasses, autoplayDelay, zoomTo, showSidebar, showMarketData,  | `deviation` |
| Hover market-data popup and the 'Data not yet available' empty state † | With data_display='toggle' the mode resolves to hover: a shared chart-popup follows the cursor showing the latest YTD volume and YoY change, or the literal string 'Data not yet available'. On /regions/asia-pacific/ no hub carries  | With dataDisplay='hover' hovering a hub opens a popup with the hub title as heading and the market-data line as body; where market data is off the popup shows just the hub name. | `deviation` |
| Hub marker click opens the connectivity sidebar | Clicking a hub marker selects the hub, paints its countries and slides the sidebar in, easing the map to padding-right 300. Works on /resources/markets-map/ and /regions/north-america/. | Broken on the map. The trayport-region-fill click handler fires after the hub handler and clears the selection, so clicking a hub inside any region boundary only changes the region. The sidebar is reachable only via route markers, | `deviation` |
| Hub marker types, sizes and name labels | ohub = filled class-coloured circle, 30px unzoomed / 100px when a region is selected, with the label set inside it. rhub = always a 100px circle with the label inside. vhub/phub = a 7px dot at world level that becomes a black/50 r | All hubs are small circles: radius 5, +2 for rhub, +3 for ohub, 1.5px white stroke. A symbol layer prints the label above every marker at every zoom, including the un-zoomed world view. | `deviation` |
| Region hover and click directly on the map polygon † | Hover changes only the cursor (DEFAULT and HOVER fill opacity are both 0, outline width both 0). Clicking a region zooms in but does NOT update the dropdown label, and once zoomed further region clicks return early. | Hover shows a popup with the region title plus a pointer cursor; clicking selects the region and the Region combobox updates in step; regions remain clickable after zooming. | `deviation` |
| Region selection dropdown and All-Regions reset (markets-map) † | DaisyUI hover dropdown overlaid top-left on the map: All Regions / Asia Pacific / Europe / North America with Font Awesome globe icons. Reset re-fits to the union of region bboxes and keeps the current asset class. | Radix 'Region' combobox in a bar above the map: All regions / Asia Pacific / Europe / North America / Canada, no icons. Reset re-fits to all hubs and keeps the current asset class. | `deviation` |
| Route mid-point markers on shipping lines † | Code exists but is entirely dormant — the WordPress database has no line_marker and no marker_svg rows at all, so no route marker has ever rendered live. | Two connections are flagged show_line_marker and render orange r7 markers at the route half-length, with a hover popup and a click that selects the far-end hub. | `deviation` |
| Single-region mode on region landing pages † | No region dropdown; a static non-clickable chip shows the region icon and title; the map is pre-zoomed to the region. | No region combobox; a read-only 'Region' panel shows the region title; the region is pre-selected and the map is pre-fitted. | `deviation` |
| CURRENT ONLY — hub-page location schematic in HubView | n/a (legacy's equivalent is the Mapbox #hub-map covered above). | HubView renders a non-Mapbox SVG location schematic as header media when a hub has no hero image and no bridge media. | `unverified` |
| Hub detail map crash when a hub has no marker locations | markerLocations.forEach throws TypeError before the load/idle handlers register, leaving an un-fitted world basemap — reproducible on /market-coverage/cee-power/. | No hub-page map exists to crash, because the page itself does not exist. | `unverified` |
| Multiple markers per hub, and multiple hubs per country † | 'NA Power' renders 8 separate labelled markers (PJM, ISONE, NYISO, CAISO, MISO, ERCOT, SSP North, SSP South) all opening the same hub. Clicking Ireland returns both Irish Power and UK Power in a merged sidebar. | Same: NA Power contributes 8 markers with the same eight labels; IRL resolves to Irish Power + UK Power in a merged sidebar headed '2 connected hubs'. | `unverified` |
| Always-on market-data readouts per hub | A permanent DOM popup at each hub's first marker showing '{value} {unit}' and '{+/-}{n}% {YoY\|QoQ\|MoM}', colour-coded green / red / neutral, skipped when the value is null or <1. Europe+Gas produced 10 popups. | A Mapbox symbol layer prints the same two lines under each hub's first marker, halo-coloured green #237a3e / red #b42318 / navy for positive / negative / flat. | `present` |
| Asset-class switching | Dropdown of Power (fa-lightbulb-cfl, #ff671f, TWh), Natural Gas (fa-fire-flame, #f7ea48, TWh), Bulk (fa-server, #f7ea48, Mt); switching re-filters ISO layers, route lines and markers, rebuilds the data dropdowns and re-fits. | 'Asset class' combobox with Power / Natural Gas / Bulk (no icons); switching re-filters hubs, marker colours, country tint and routes, resets the period and re-fits. | `present` |
| Data-driven country recolouring by period value | colorIsoRegionsByDataType builds a per-ISO match expression, but every stop is the same colour as the fallback (#009CDE opacity 1) and the computed min/max are never used, so changing interval or period never shades the map. | Country tint is a flat #009cde at 0.42 regardless of period; changing the period only changes the printed values. | `present` |
| Fullscreen toggle | Markup wrapped in @if(null && $show_fullscreen) so it never renders; no [id^=fullscreen-toggle-] exists in the live DOM. | No fullscreen control of any kind. | `present` |
| Homepage global connection schematic ('Explore our connectivity') | 570x350 non-interactive Mapbox, one circle layer per asset class plus a full pairwise line mesh per class, auto-fit, hover popup with the marker-location name; class toggles and 5s slideshow dormant. | 600x350 non-interactive Mapbox with the same per-class circle layers and pairwise mesh, auto-fit, hover popup with the location title; no toggle buttons on home. | `present` |
| Joule / autoTRADER venue capability grouping on the hub page | Below the hero: 'Connected Venues' -> a Joule badge with Brokers / Exchanges / Clearing Houses grids, a divider, then an autoTRADER badge with the same sub-groups; explicit 'No Joule connectivity' / 'No autoTRADER connectivity' em | Identical structure on the one published hub page. | `present` |
| Map is fully non-interactive (no pan, zoom, rotate or keyboard camera) | Every map is constructed with interactive:false; no NavigationControl, no scroll zoom, no drag pan. All navigation is via dropdowns and clicks. | Same: interactive:false, no zoom controls, drag does nothing, the wheel scrolls the page. | `present` |
| Mapbox attribution and logo | Attribution control enabled with '© Mapbox © OpenStreetMap Improve this map' and one Mapbox logo on the markets map. | Identical: attributionControl enabled, one .mapboxgl-ctrl-logo, same attribution string. | `present` |
| Sidebar can be disabled per map instance | show_sidebar is an ACF option. When 0 (Europe, Asia Pacific) openSidebar returns immediately, so marker and country clicks are silently inert, although the off-screen panel markup is still emitted. | Same block setting. When off there is no sidebar and no 'Show connections' buttons at all. | `present` |
| Sidebar open/close animation and map padding easing | Panel slides in and the map eases to padding-right 300 over 300ms; the 'Close Sidebar' button eases padding back to 50, not 0, so the map stays offset. Selection is not cleared on close. No Escape or click-outside. | An <aside> opens with camera padding-right 340; a 'Close' button (which receives focus automatically) closes it; on mobile it becomes a bottom sheet pinned to the lower edge. | `present` |
| Single live map implementation across all map surfaces | Only partials/markets-map.blade.php renders; six superseded markets-map-* partials plus market-map-reference.blade.php and single-hub-with-charts.blade.php are dead code. | One shared React runtime (RegionalMarketMapRuntime.client.tsx) drives all four regional surfaces; no dormant variants. | `present` |
| Surfaces that deliberately have no map, and the absence of a legend | /market-coverage/ is a plain hub archive with no map; /venue/{slug}/ has no map; /regions/ is a 404. No legend element exists on any map surface — asset-class colour, hub-type shape, route colour and country fill are unexplained. | /market-coverage/ is still a plain index ('Markets connected across regions') with no map block, and there is still no legend on any map surface. | `present` |
| Zoom / fit-to-bounds behaviour | zoom_to='markers' on every instance: fit to the LngLats of the active class's markers in the region, duration 500, maxZoom 5, padding 100, falling back to the region GeoJSON bbox with padding 1 when the class has no markers there. | fitBounds to visible marker positions (or the region boundary when zoomTo='region'), maxZoom 5, padding 52/48/52/48 growing to 340 on the right while the sidebar is open, 450ms (0ms under prefers-reduced-motion). minZoom 0.8 / max | `present` |
| Behaviour when Mapbox is unavailable | No fallback at all — a blank 650px light-blue rectangle with zero controls, zero markers, no message, no static image and no hub list. | data-map-error flips to true, the WebGL layer unmounts and the deterministic server-rendered SVG stays at full opacity over the managed background image, with all four comboboxes, the live region, 26 hub articles and every hub/ven | `improvement` |
| CURRENT ONLY — 'Countries with multiple market hubs' shortcut buttons | n/a. | Inside the accessible list, one button per country that maps to more than one visible hub, labelled '<ISO3>: N hubs', selecting all of them. | `improvement` |
| CURRENT ONLY — accessible alternatives for the global schematic | n/a — the legacy schematic is a bare canvas with no title, description or text alternative. | role=img with <title> and <desc>, per-region <title> tooltips, a visually hidden list of every plotted point as '<Asset class>: <location>', and a figcaption stating how many regions are shown. | `improvement` |
| CURRENT ONLY — accessible market-hub and venue list | n/a — legacy offers no text or table alternative to the map at all. | A <details> block 'Accessible market-hub and venue list' with one article per visible hub: linked title, market-data summary, a nested details listing every connected venue with link and capability label, and a 'Show connections'  | `improvement` |
| CURRENT ONLY — aria-live status line | n/a — legacy announces nothing when the region, class or period changes. | An aria-live=polite paragraph reading 'Showing N hubs for <class> in <region> / across all regions.', updating on every filter change. | `improvement` |
| CURRENT ONLY — deterministic server-rendered SVG map behind the interactive layer | n/a — legacy renders nothing until Mapbox loads and nothing at all if it fails. | An equirectangular SVG with one circle per visible hub in its asset-class colour and one line per connection, over a themed gradient or the managed background image, fading out once Mapbox reports ready. | `improvement` |
| CURRENT ONLY — lazy activation of the Mapbox runtime on scroll | n/a — legacy constructs every Mapbox map at page load. | The runtime is imported and mounted only once an IntersectionObserver fires (350px root margin for regional maps, 300px for the global map). | `improvement` |
| CURRENT ONLY — managed background media behind the map | n/a — the legacy container is a flat bg-base-300 colour. | An editor-set image or video renders beneath the SVG with the gradient made transparent, so the pre-Mapbox and failure states show editorial map artwork. | `improvement` |
| CURRENT ONLY — market-data summary inside the sidebar and hub cards | The map sidebar carries no market data at all; the per-hub Highcharts sparkline exists but every call site is commented out. | Each selected hub card and each accessible-list article carries '<period>: <value> <unit> (<+/-x.x>% <MoM\|QoQ\|YoY>)'. | `improvement` |
| CURRENT ONLY — public market-data API endpoint | n/a — legacy inlines chart_data into the page payload. | GET /api/market-map-data/ with assetClassKey + interval + optional period returns periods, status and per-hub summaries, cached and returning 503 when unavailable. | `improvement` |
| Clicking a shipping route selects the hub at the far end | Dead. The click handler starts with e.stopPropagation() on a Mapbox MapMouseEvent, which has no such method, so it throws before doing anything. | Hovering a route shows a popup with the far-end hub name and a pointer cursor; clicking selects that hub and opens the sidebar. | `improvement` |
| Hub-to-hub route lines | Connections with a GeoJSON line become their own layer, #F56A00 at width 2, hidden unless the class is active. Live: 4 routes (bulk API2-API4; gas LNG Europe-LNG Asia, LNG Europe-Henry Hub, Henry Hub-LNG Asia). Connections with no | Managed route GeoJSON when present, otherwise a straight source-target segment, styled #009cde width 4 opacity 0.5 with round caps; endpoints outside the current region are retained so regional views still draw whole routes. | `improvement` |
| Keyboard and assistive-technology access to the map controls | No usable keyboard path. Dropdown triggers are focusable divs but the option rows are bare divs with no tabindex, no role and only a click listener; Enter on the trigger does nothing. Markers are role=img divs with no tabindex. No | Radix comboboxes are fully keyboard operable; the accessible hub/venue list toggles with Enter; the canvas container is aria-hidden; the block is a labelled section; selecting hubs moves focus to 'Close hub details'; state changes | `improvement` |
| Market-data interval and period controls | Two extra dropdowns appear ONLY when a region is selected AND at least one hub of the active class has chart_data: YTD / By Quarter / By Month (default By Quarter) and a period list built from the union of hub keys. Live Europe+Ga | A 'Data interval' combobox (Year to date / Quarter / Month, default Quarter) and a 'Period' combobox are always present on market-data blocks, with 20 quarters (2021 Q1-2025 Q4), 60 months and 5 years, defaulting to the latest and | `improvement` |
| Mobile and touch behaviour | Desktop layout is kept on a 390px viewport (650px map, 288px sidebar = 74% of the screen). Critically, colorIsoRegionsByDataType early-returns unless (hover:hover) and (pointer:fine), so on real phones NO market-data popups are dr | Controls wrap to full width, the shell is 350x650, the sidebar becomes a bottom sheet (max-height 70%, own scroll), and the market-data values DO render on touch because they are a map symbol layer with no hover guard. | `improvement` |
| Points of interest (region office locations) | Two white 10px SVG dots (Trayport Head Office, London; TMX Head Office, Toronto) with a hover popup carrying the ACF popup_text. On /resources/markets-map/ the hover handler returns early unless a region is already selected, so th | White r4 dots with a 2px navy stroke, filtered to the active region, with a hover popup — working immediately at world view with no zoom gate. | `improvement` |
| Sidebar content: hub links and venue grouping | One full-width primary button per selected hub linking to the hub permalink, then venues grouped by root venue type into bordered cards headed 'Brokers' / 'Exchanges' / 'Clearing Houses', alphabetised, with per-hub subheadings for | Same structure with an eyebrow, hub cards (each carrying its market-data summary line), groups headed 'Broker' / 'Exchange' / 'Clearing House', the same common-vs-per-hub merge, plus a per-venue capability label (Joule / autoTRADE | `improvement` |
| Visual confirmation of which country/hub is selected | A yellow #F7EA48 'selected-iso-layer' exists but is fully occluded: it sits at style index 67 while the opaque #009CDE per-class country fills sit at 84-96 over the same polygons. Users see no selection highlight. | Selected countries render in visible yellow (#f7ea48 at 0.72 opacity) above the blue 'visible countries' tint. | `improvement` |

## Data fidelity matrix

| Capability | Live site | Migrated | Verdict |
| --- | --- | --- | --- |
| Asset class icons (icon name and inline icon_svg) | icon Font Awesome names on 9 terms (power lightbulb-cfl, gas fire-flame, bulk server, climate seedling, coal excavator, iron ore industry-windows, freight truck, oil oil-well, environmentals seedling) plus icon_svg inline markup o | asset_classes has no icon and no icon_svg column; the served asset class objects expose only color, displayOrder, id, legacyID, marketDataKey, slug, title, volumeLabel. | `missing` |
| Custom marker artwork — per-hub marker_svg and route midpoint marker_svg | Per-hub custom_marker=0 and marker_svg empty on all 72 (feature defined, zero data). Route rows carry 2 real inline SVGs: a 1268-char Font Awesome 6.7.2 ship glyph on both lng-europe connections. | No per-hub custom marker field (nothing was lost there). Route rows have show_line_marker boolean plus line_marker_label text ('LNG Asia', 'Henry Hub (US)') — no SVG column anywhere. | `missing` |
| Per-marker map zoom level | Every marker_locations latlng blob carries its own authored zoom. Observed spread 3-7, e.g. uk-power 7, eua 4, henry-hub 5, NA Power mixed 4 and 5, australian-gas 4. | No per-marker zoom field exists in hubs_map_markers. hubs.map_zoom is populated on 72/72 but is the single value 6 on every hub. | `missing` |
| Region icon (map UI region selector) | icon field per region holding a Font Awesome name: earth-europe, earth-americas, earth-asia. | regions table has no icon column and the served region objects expose only boundary/centre/id/label/pointsOfInterest/title/zoom. | `missing` |
| Venue logos | logo attachment ID set on 66/66 published venues. | venues.logo_id populated on 1/66. | `missing` |
| Asset class colours (the map's entire colour scheme) | Only 4 terms have a real brand colour: Power #ff671f, Natural Gas #f7ea48, Bulk #f7ea48, Climate #32b77b. The other 8 have color_type='none' or no colour meta, and MarketsMap.php resolves them through getColor()/the '#FF671F' fall | The same 4 brand colours are exact. The remaining 8 were assigned new values: environmentals/oil/iron-ore/freight/coal/emissions = #002d72 (dark blue) and renewables/weather = #00c1d5 (cyan). | `deviation` |
| Asset class measurement labels (volume / price / currency) | volume_label on 4 classes (Power TWh, Gas TWh, Bulk Mt, Climate MT); price_label '€' and price_currency 'EUR' on the same 4. | map_appearance_volume_label TWh/TWh/Mt/MT and map_appearance_price_label '€' on the same 4 classes; map_appearance_currency is empty string on all 16 rows. | `deviation` |
| Asset classes — inventory and display_order | 12 asset-class taxonomy terms, of which 7 are used by hubs. display_order term meta: power 1, gas 2, climate 3, renewables 3, bulk 4, environmentals 4, coal 5, iron ore 6, freight 7, oil 8; emisisons blank, weather no meta at all. | 16 rows: the same 12 real classes (matched by legacy_source_legacy_id 21,22,25,26,27,88,89,90,108,109,114,192) with identical display_order values, plus 4 extra 'archetype-...-chart-asset' rows (ids 251-254) with 0 hub uses and 0  | `deviation` |
| Hub and venue click-through destinations from the map | Every hub links to an on-site page /market-coverage/{slug}/ and every venue to /venue/{slug}/; the /market-coverage/ index lists 73 distinct hub links. | 56 of 57 hubs on the markets-map link to absolute external https://www.trayport.com/market-coverage/{slug}/; only german-power is local. Venues link to third-party corporate sites (abaxx.exchange, aemo.com.au), 10 have no destinat | `deviation` |
| Hub marker ordering, and the derived hub map centre on the one multi-marker hub | north-american-power marker_locations authored in repeater order 0-7: PJM, ISONE, NYISO, CAISO, MISO, ERCOT, SSP North, SSP South. Row 0 = PJM (Valley Forge, PA). | Same 8 markers but re-sequenced alphabetically in _order 1-8: CAISO, ERCOT, ISONE, MISO, NYISO, PJM, SSP North, SSP South. hubs.map_centre for that hub = 38.6719495/-121.1612945 = CAISO (Folsom, California). | `deviation` |
| Hubs with no coordinates — how they are handled on the map | 17 published hubs have zero marker_locations and simply render no pin. On /resources/markets-map/ CEE Power appears in the class list with marker_locations = [] and no map point. | All 17 store NULL lat and NULL lng, but the index builder coerces a null centre into a real point: coordinates() does Number(null) === 0, so hubs emit a synthetic point at [0,0] (Gulf of Guinea). | `deviation` |
| Live /resources/markets-map/ payload — end-to-end reconciliation † | 57 hubs, 56 pins, 60 venues, 590 venue connections, 3 regions, 3 asset classes. | 57 hubs, 64 points, 60 venues, 601 venue connections, 3 regions, 3 asset classes, 6 connections. | `deviation` |
| Live region-page payloads (cross-region route endpoints) † | Europe 40 hubs, Asia Pacific 4, North America 5. Route targets are not in the hub list; each connected_hubs entry inlines the target's lat/lng/permalink instead. | Europe 42, Asia Pacific 7, North America 7. The extras are exactly the LNG route endpoints (Henry Hub, LNG Asia, LNG Europe, LNG Mexico Pacific) carried so the client can draw the full route. | `deviation` |
| Mapbox style, token and choropleth constants † | Hardcoded in markets-map.blade.php: style mapbox://styles/synesis/cm5a5svbz001201sc9h355wja, MAPBOX_ACCESS_TOKEN PHP constant, default centre lat 30 / lng 20, SELECTED_ISO_COLOR #F7EA48, DEFAULT/HOVER fill-opacity 0 and outline-wi | Config-driven: MAPBOX_STYLE_DARK_URL = the identical style ID cm5a5svbz001201sc9h355wja, plus a new MAPBOX_STYLE_LIGHT_URL (cm7nf3tgh000f01sc67zobky8) and MAPBOX_PUBLIC_TOKEN in env. Country highlight is still #f7ea48. | `deviation` |
| Region map centre and zoom | Centres Europe 36.18024775863504/7.782570049999986, North America 35.21621055951458/-98.54261915, Asia Pacific 14.493734770373086/134.10269530896863. Authored zooms: Europe 3, North America 2, Asia Pacific 3. | Centres identical to full precision. map_zoom = 4 on all four region rows. | `deviation` |
| Rendered Mapbox output and market-data values † | Could not confirm painted markers, and chart_data was non-null on only 11 of 57 hubs in the local render. | Could not confirm painted markers; market data is bound differently, via hubs.market_data_key (72/72) and 158 hub aliases rather than chart_data embedded per hub. | `deviation` |
| Schematic/connections map autoplay interval | delay stored in milliseconds: home 5000 (5s), about-us instances 8000/8000/5000, broker-trading-system 8000. | autoplay_delay stored in seconds and clamped 2-30 then multiplied by 1000; every globalConnections block is set to 30. | `deviation` |
| Hub country codes — own ISO code plus connected_locations highlight set | `code` (ACF clone persisting under key `code`): 54 hubs with a real alpha-3, 18 set to the literal 'NONE'. connected_locations: 34 rows across 11 hubs (eua 22, lng-asia 2, nordic-power 2, 8 hubs x 1). | hubs.country_code populated on 54/72, NULL where legacy said NONE. hubs_connected_country_codes: 34 rows across the same 11 hubs. | `present` |
| Hub map markers (the actual map pins) — count and coordinates | 62 marker_locations repeater rows across 55 published hubs (54 hubs x 1 row, north-american-power x 8). 17 hubs have no coordinate at all. 18 rows carry a name, 44 blank. | 62 rows in hubs_map_markers across the same 55 hubs, same 54x1 + 1x8 distribution. 18 labelled, 44 blank. Same 17 hubs have no coordinates. | `present` |
| Hub types (vhub / phub / ohub / rhub) | venue_type select on hubs, 4 choices. Live: vhub 62, rhub 5, ohub 4, phub 1 = 72. | hubs.hub_type Postgres enum with the same 4 labels. Live: vhub 62, rhub 5, ohub 4, phub 1 = 72. | `present` |
| Hub → asset class | Power 27, Natural Gas 23, Bulk 10, Climate 9, Coal 1, Oil 1, Weather 1 = 72; exactly one class per hub. | hubs_rels path='assetClasses': power 27, gas 23, bulk 10, climate 9, coal 1, oil 1, weather 1 = 72; exactly one per hub. | `present` |
| Hub → region membership | Meta-only term ID (ACF save_terms=0, so zero rows in wp_term_relationships): Europe 29 = 54 hubs, Asia Pacific 31 = 8, North America 30 = 7, All 133 = 3. | hubs_rels path='regions': europe 54, asia-pacific 8, na-canada 7, all 3. Exactly 1 region per hub, 72 rels / 72 hubs. | `present` |
| Hub-to-hub routes / shipping connections (geometry) | connected_hubs repeater: 8 rows across 5 hubs, gated by the connected_hub toggle. 4 rows carry hand-drawn GeoJSON LineStrings, 4 are empty and fall back to a computed route. | hubs_map_connections: 8 rows across the same 5 hubs, same source→target pairs, same 4 with route jsonb and same 4 NULL. | `present` |
| Hubs (market locations) — collection inventory and show_on_map gate | 72 published hub posts (no drafts/trash). show_on_map=1 on 70, =0 on 2 (3326 Storage Capacity, 6800 CER). | 72 hub rows, all _status='published'. show_on_map true on 70, false on 2 — slugs storage-capacity (legacy_source_legacy_id 3326) and cer (6800). | `present` |
| Per-page map block presentation settings (height, sidebar, zoom-to, market data) | markets-map height 650, show_sidebar 1, zoom_to markers, commsrep_data latest, data_display always. europe 550 / sidebar 0 / latest / always. asia-pacific 500 / sidebar 0 / commsrep none. north-america 600 / sidebar 1 / latest / a | markets-map 650 / sidebar t / markers / show_market_data t / always. europe 550 / f / t / always. asia-pacific 500 / f / show_market_data f / hover. north-america 600 / t / t / always. home 350 / 3 / #009cde / 0.2 / 0.5 / show_lin | `present` |
| Per-page map block scoping (which classes / regions / venue types each placement shows) | markets-map: classes [108 Bulk, 22 Gas, 21 Power], regions [31,29,30], venue types [41,43,42]. europe: [22,21] / [29] / 3 types. asia-pacific: [22,21] / [31] / 3. north-america: [22,21] / [30] / 3. home: [22,21] / [31,29,30] / 3. | markets-map: [bulk,gas,power] / [asia-pacific,europe,na-canada] / [broker,clearing-house,exchange]. europe: [gas,power] / [europe] / 3. asia-pacific: [gas,power] / [asia-pacific] / 3. north-america: [gas,power] / [na-canada] / 3.  | `present` |
| Region boundary polygons (GeoJSON) | geojson field on each of the 3 regions; one FeatureCollection with a single Polygon each, stored lengths 2668 / 2708 / 2682 chars. | regions.map_boundary jsonb on the same 3 regions; FeatureCollection with exactly 1 Polygon feature, 1 ring each; 2808 / 2848 / 2822 chars serialized. | `present` |
| Region points of interest (office pins) | marker_locations repeater on regions: 2 rows total — Europe 51.5213326/-0.0815098 popup 'Trayport Head Office'; North America 43.6485315/-79.3833421 popup 'TMX Head Office'. Asia Pacific has none. | regions_map_points_of_interest: 2 rows — europe 51.5213326/-0.0815098 popupText 'Trayport Head Office'; na-canada 43.6485315/-79.3833421 popupText 'TMX Head Office'. asia-pacific has none. | `present` |
| Regions (the map's geographic layers) | 3 published region posts: Europe 844, North America 843, Asia Pacific 845. No 'All' region post (term 133 exists but has no post). | 4 rows: europe, na-canada, asia-pacific plus a synthetic 'all' region carrying no map data, which gives the 3 legacy hubs tagged region 133 somewhere to live. | `present` |
| Venue types (taxonomy → collection) | 3 flat terms: Broker 41, Exchange 42, Clearing House 43, with display_order term meta 1/2/3 driving legend grouping. | 3 rows: broker/exchange/clearing-house with display_order 1/2/3 and map_label 'Broker'/'Exchange'/'Clearing House'; parent NULL on all. | `present` |
| Venue → hub connections (the 650+ row edge set) | 657 connections rows across 64 venues, 67 distinct hub targets, 0 dangling. Type split d=419, b=218, a=20. | 655 rows across the same 64 venues, same 67 hub targets, 0 NULL hub_id. Type split d=417, b=218, a=20. | `present` |
| Venues (collection inventory) | 66 published venue posts plus 1 private. Venues carry no coordinates of their own. | 66 venue rows, all published; the private one was not migrated. 0/66 have coordinates. | `present` |
| Venue → asset class relationship | 8 denormalized cache keys (coal/gas/power/oil/renewables/iron_ore/freight/environmentals) on 57 venues, with no ACF field definition anywhere and no identified writer — stale, unattributed data. | venues_rels path='assetClasses': 133 rows across 64 venues, modelled as a real relationship. | `improvement` |

## Corrections applied

Both adversarial reviewers returned `holds=false`. The re-grades marked `†` above are theirs:

- **Country highlighting** was graded `present`; pixel sampling at identical points gives legacy
  `rgb(0,156,222)` against `rgb(13,125,167)`. Its legacy description was also wrong — legacy does
  tint Australia for Bulk.
- **Absent-data behaviour** was graded `present`; it is the `[0,0]` defect above. The row also
  miscounted legacy Bulk markers as 4 by counting two POI dots.
- **Rendered Mapbox output** was graded `unverified` "on both sites", which is false symmetry.
  Legacy renders fully once its hardcoded `trayport.local` bundle host is rewritten; the migrated
  build was the one that failed to render.
- **Two rows graded `improvement`** did not pass the one-sentence test: region polygons becoming
  clickable is the same change that killed the sidebar click path, and the Mapbox style row claimed
  a light style that already exists in the legacy theme.
- **Two capabilities were missing from the matrix entirely** and have been added: the region-page
  default asset class, and route hover highlighting.

## What remains unverified

- Country merge rules — a legacy click on Ireland returned only Irish Power, not the merged set the
  matrix claimed, while the migrated build returns two hubs.
- The commodities-report map surface. The legacy page returns a Symfony exception, so its behaviour
  is unobserved on both sides. It remains out of scope per the locked decisions.
- Hub detail location maps, which are unreachable while 71 of 72 hub pages are unpromoted.

## Note on the local review server

Next.js blocks cross-origin development asset requests, so on any host other than `localhost` the
map islands never hydrated and every map silently showed its static fallback — including on the LAN
address used for review. `allowedDevOrigins` is now driven by `DEV_ALLOWED_ORIGINS`. This was an
environment defect, not an application one, but it invalidates any earlier visual judgement made
over the LAN address.
