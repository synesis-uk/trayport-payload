# Frontend plan completion matrix

This document is the completion authority for the frontend-system and visual-parity plan. A row is
complete only when the named source artifacts exist, are used by the public frontend, and the
listed verification evidence passes. Compatibility, a successful build, or an isolated screenshot
does not by itself close a row.

## Locked implementation decisions

- Next.js and Payload remain one self-hosted application backed by PostgreSQL.
- Tailwind CSS `4.3.3` is the styling implementation.
- Radix/shadcn patterns are used only for accessible interaction primitives.
- Font Awesome is the sole interface-icon system. Brand marks, chart glyphs, flags, and specialist
  map geometry are explicit exceptions.
- Tailwind Plus and Catalyst are source and API references, not additional runtime systems.
- Material Design contributes interaction and hierarchy principles only; Material UI is not used.
- `http://trayport.local` is the visual and content reference for reachable production routes.
- Payload exposes bounded semantic controls; editors cannot enter utility classes, arbitrary
  colours, raw HTML, scripts, layout widths, or icon identifiers.

## Requirement-by-requirement status

| # | Requirement | Completion evidence | Current status |
| --- | --- | --- | --- |
| 1 | Record the frontend-system contract. | `docs/frontend-system.md` documents ownership, dependencies, component rules, the Payload boundary, parity/change control, and verification. Contract tests enforce the dependency and route gates. | Complete; keep synchronized with implementation. |
| 2 | Build the route/component inventory. | `docs/frontend-inventory.md` reconciles the 296-destination source inventory with 18 content archetypes plus one temporary-redirect archetype, React/data/CSS owners, shared patterns, responsive and interactive states, legacy-to-Font-Awesome mapping, and the 26-root migration acceptance slice. | Complete as an ownership inventory; 25 accepted roots render managed content, one accepted root is an explicit 302, and the 268 plan-only document bodies remain separate content-migration work. |
| 3 | Establish the design-token foundation. | `src/styles/tokens.css` exposes documented semantic colour, typography, spacing, container, border, radius, elevation, breakpoint, focus, motion, chart/map palette, and z-index tokens; components consume semantic tokens and contract tests reject duplicate sources. | Complete; compatibility aliases remain until their verified consumers are retired. |
| 4 | Integrate Font Awesome throughout. | One typed registry maps every interface-icon role and imported legacy choice; direct library imports are restricted to the registry; the gallery mounts every semantic key and browser tests verify every SVG; documented exceptions are bounded. | Complete for the implemented route/component inventory; visual glyph placement remains part of route acceptance. |
| 5 | Normalize the primitive layer. | Typed, reusable Button/button-link, Input, Textarea, Select, Checkbox, Dialog, Popover/menu, Disclosure/accordion, Pagination, and FormField/help/error components exist in `src/components/ui`; focused UI and real-browser tests cover their relevant disabled, loading, invalid, indeterminate, keyboard, portal, and focus-restoration states. | Complete; the inventory records intentional native FAQ/listing controls where native semantics are sufficient. |
| 6 | Build the reusable composition layer. | `Container`, `Section`, `Stack`, `Cluster`, `Grid`, `HeadingGroup`, `Eyebrow`, `ActionGroup`, `Hero`, `Surface/cards`, `StatGrid`, `MediaBlock`, `IconText`, `LogoCloud`, `CTASection`, and focused shell components exist, accept `className`, and avoid baked placement margins. Core hero, heading, action, media, stat, section, loading/error and shell compositions are used publicly; specialist compositions remain gallery-proven until matching content enters scope. | Complete as a bounded reusable API; public adoption is semantic rather than forced, and route-specific parity CSS remains a temporary consumer-side bridge. |
| 7 | Separate CMS adapters from presentation. | Every supported Payload block has a generated-type-backed adapter that normalizes data into an explicit presentation model. Dispatch is compile-time exhaustive. Presentation modules do not cast through `UnknownRecord` or know Payload field shapes, and no monolithic renderer remains. | Complete; the typed adapter, normalizer, and presentation families replace the removed monolithic renderer. |
| 8 | Complete the gated design-system gallery. | `/design-system/` is unavailable by default and, when enabled, deterministically shows tokens, primitive/composition variants, every Font Awesome key, short/long content, missing media, loading/empty/error states, and mobile/tablet/desktop surfaces without CMS access. UI, keyboard/focus, axe, icon, and cascade checks pass. | Complete: both owned desktop/mobile screenshots and both real-browser interaction/cascade contracts pass; WordPress references remain separate and untouched. |
| 9 | Migrate a representative vertical slice on two differently composed pages. | Header/nav, hero, actions, one content section, a stat/card pattern, CTA, and footer render through the new system on two golden routes. Redundant parity selectors are removed only after desktop/mobile screenshots, keyboard checks, and route tests pass. | In progress: Home and Joule use the typed system and focused route tests pass; exact desktop/mobile visual acceptance is still open. |
| 10 | Roll out by component family, then refactor and remove superseded code. | Shell/navigation, heroes/intros, content sections, cards/listings/filters, forms/CTA, structured market/venue content, charts/data tables, maps, and route-specific details all meet reference acceptance or a recorded approved deviation. The final Next.js 16/Tailwind 4 audit is resolved; superseded CSS/dependencies are removed; every required suite passes. | In progress: the architecture, audit, content import, strict comparison harness, and exact Home map topology/runtime boundary are implemented. Provider-rendered map acceptance awaits approved runtime configuration; compatibility CSS and all five exact route acceptances remain open. |

## Per-slice acceptance gate

For each migrated component family or route:

1. Compare deterministic desktop and mobile screenshots against the matching WordPress reference.
2. Exercise pointer, keyboard, focus, disclosure/dialog, and responsive behavior where applicable.
3. Run focused UI/integration tests, lint, and typecheck before widening the change.
4. Run the production build and route E2E suite after the family is integrated.
5. Record each intentional improvement with its isolated hook and rollback in
   `docs/frontend-improvements.md` or `docs/visual-parity.md`.
6. Remove compatibility selectors only after all routes that consume them pass.

## Final completion evidence

The plan is complete only when all ten rows are complete and current evidence includes:

- formatting and Tailwind canonicalization checks;
- lint and TypeScript checks;
- the complete integration and UI test suites;
- a production Next.js build;
- route, keyboard/accessibility, robustness, and performance E2E suites;
- deterministic desktop and mobile visual comparisons for every golden route;
- a production-mode local server running the verified build.

### Latest implementation-slice evidence (2026-08-04)

- Prettier, canonical Tailwind, ESLint, TypeScript, and `git diff --check` pass.
- The complete integration suite passes 457 tests across 53 files; the UI suite passes 99 tests
  across 19 files.
- The production E2E run discovers 258 tests: 239 pass and 19 are intentionally skipped behind
  documented external or environment gates.
- The deterministic design-system gallery passes all four checks across its desktop and mobile
  projects: two screenshot comparisons and two interaction/cascade contracts.
- The Next.js `16.2.6` production build and postbuild sitemap/budget checks pass. The shared public
  shell is 134,958 raw bytes and 44,697 gzip bytes. Route gzip evidence is:

  | Route | JavaScript | CSS | All segment RSC |
  | --- | ---: | ---: | ---: |
  | `/` | 203,442 B | 36,662 B | 7,881 B |
  | `/_not-found` | 153,860 B | 24,824 B | 5,826 B |
  | `/[...segments]` | 203,442 B | 36,662 B | 8,533 B |

- The verified production server returns HTTP 200 for the public site, liveness, readiness, and
  the hash-guarded hero asset. Exact golden-route visual acceptance remains open and therefore
  keeps requirements 9 and 10 in progress.
