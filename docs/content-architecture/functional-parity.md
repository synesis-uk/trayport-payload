# Functional parity audit

## Audit outcome

**Partially complete.** The source feature baseline is substantially understood,
but target parity and launch verification are not complete. The accepted runtime
position is **73 of 317 route owners (23.0%)**: 70 rendered Payload owners, one
managed redirect owner, and two virtual indexes. The other 244 owners remain
plan-only. Immutable inventory and target-plan run
`people-events-inventory-20260805-1400` proves the 317-owner authority, including
17 retained People routes, three net-new canonical Event routes, and 53 redirect
candidates.

The authoritative feature catalogue is
`migration/mappings/functional-parity.v1.json`, parsed by
`migration/mappings/functionalParity.ts`. It complements the route inventory:

- the route inventory answers **which canonical URLs need an owner**;
- this catalogue answers **whether required behavior exists across source,
  schema, editor, runtime, migration, and verification**; and
- neither contract may silently change the other.

## Findings

### High

1. **The full content launch gate is still open.** Source discovery proves all
   317 owners, but only 73 are in the accepted runtime slice. Complete article,
   hub, venue, and Learning Hub detail ownership, managed links, media, SEO, and
   review evidence remains outstanding for 244 owners.
2. **Launch integrations are not complete.** HubSpot now has a bounded editor
   block, WordPress transform, and inert accessible runtime mount, but provider
   activation and submissions remain deferred with CookieYes. TIM is also
   deferred and remains a launch requirement. Analytics is missing: the audited
   `GTM-P8HWX2S` container has no consent-gated Next.js runtime or network
   acceptance.
3. **Scheduled banner parity is partial.** The new target models content, dates,
   page targeting, placement, priority, page rendering, migration transforms,
   and the four-event notification task. The accepted source run extracted and
   loaded all four banners plus five dependent Pages and referenced media with no
   unresolved relationships. The active banner is now mapped locally to Sophie
   Ingham-Clark through a roleless notification-only identity, while the three
   expired-banner recipients remain unmapped. Desktop and mobile browser
   placement, targeting, link, and dismissal acceptance pass; production
   scheduler/SMTP delivery acceptance remains open.
4. **Video caption support is missing.** The source audit found 32 MP4
   dependencies and one SRT dependency, while Payload has no subtitle-track
   model, migration mapping, `<track>` runtime, or acceptance test.

### Medium

1. **Whole-site search is implemented locally but not production-accepted.** The
   former Insights-only handoff has been replaced by a URL-backed results view
   across published, indexable Pages, Articles, People, Hubs, Venues, and
   Learning Videos. Public projections, bounded cache invalidation, ranking,
   excerpts, pagination, and accessible UI are implemented; full-corpus
   relevance and production-volume acceptance remain open.
2. **Redirect migration is incomplete.** WordPress has 50 published rules (49
   permanent and one temporary); the accepted target has one ordinary legacy
   rule plus the Request A Demo route owner. Known duplicate, missing-target,
   private-target, loop/chain, and shadowing cases still need disposition.
3. **People and Event scope is resolved, but corpus acceptance is open.** All 17
   published People routes are retained. The five legacy `/events/` records
   merge into Article events under `/event/`: two collide with existing core
   records, three add canonical owners, and all five legacy paths become 301
   aliases. The distinct Commodity Trading Week and Energy Trading Week core
   paths are preserved. The immutable inventory and target plan pass; complete
   loading, SEO/privacy, redirect-graph, and visual review remain open. Source
   team semantics are retained: Matthew Brief and Nicole Rosenberg remain `ceo`,
   rather than being silently reclassified as careers profiles.
4. **Publishing is implemented but not closed as a matrix.** Draft, preview,
   versions, scheduling, publish access, and public revalidation exist. Every
   collection/role/transition combination, including duplicate submissions and
   scheduled path changes, still needs one final verification matrix.

## Benchmark comparison

### Improved

- Feature parity is now versioned and machine-validated rather than inferred
  from route coverage or delivery-slice prose.
- Every catalogue item has an explicit six-dimension assessment, evidence,
  acceptance criteria, and next action.
- “Complete locally” is bounded explicitly, allowing maps, Market Matrix, and
  charts/market data to remain complete without implying production launch.
- Missing, deferred, excluded, and decision-required work can no longer be
  collapsed into one ambiguous “not done” state.

### Unchanged

- The authoritative generated route corpus is now 317 after the published banner
  exposed the previously undiscovered EEX News Page and the approved People/Event
  scope added 20 net owners; the Commodities Report remains excluded.
- Production readiness remains blocked.
- HubSpot provider activation/submission, CookieYes, and TIM remain outside the
  completed local slice.

### New or newly explicit risks

- The catalogue is a reviewed snapshot, not automatic proof that its evidence
  still behaves correctly. Any feature implementation must update its status
  and strengthen behavior tests in the same change.
- The local banner load now proves the approved Sophie recipient mapping without
  granting CMS access, but production delivery still depends on SMTP, scheduler,
  recipient, and monitoring acceptance.
- The delivery ledger prevents concurrent/rescheduled duplicates and retries
  recorded SMTP failures, but SMTP has no idempotency key. A process crash after
  SMTP accepts a message and before the ledger records it can produce one
  duplicate when the stale lease is recovered; production monitoring must make
  that rare ambiguity visible.
- The search cache is a normalized projection rather than an external index;
  full-corpus relevance and response-time evidence must confirm that this remains
  appropriate at production volume.
- The 317-owner inventory and 53-candidate redirect graph now pass, but planning
  evidence is not a substitute for complete content, SEO/privacy, visual, and
  redirect-runtime review across the remaining 244 owners.

## Updated scorecard

The catalogue contains 20 features: 3 complete, 11 partial, 2 missing, 3
deferred, no decision-required features, and 1 excluded.

| Dimension | Current assessment |
| --- | --- |
| Source | 19 complete; 1 partial |
| Schema | 16 complete; 1 partial; 1 missing; 1 decision; 1 excluded |
| Editor | 15 complete; 2 partial; 1 missing; 2 excluded |
| Runtime | 10 complete; 5 partial; 2 missing; 2 deferred; 1 excluded |
| Migration | 6 complete; 10 partial; 1 missing; 1 deferred; 2 excluded |
| Verification | 4 complete; 12 partial; 2 missing; 2 deferred |

Status is assessed against each feature's stated boundary. In particular,
“complete” for maps, Matrix, and charts means their agreed local slice is
complete; production-like volume, provider configuration, licensing, and UAT
remain release gates.

## Resolved decisions

The feature-level decision queue is empty:

1. **Search:** ship whole-site search across all public Payload route-owner
   collections, replacing the temporary Insights-only handoff.
2. **People:** retain all 17 published detail routes; six private WordPress
   profiles remain private and outside the public corpus.
3. **Events:** merge the separate Events CPT into Article events, use `/event/`
   as canonical, deduplicate the two collisions, retain three unique records,
   preserve the distinct Commodity Trading Week and Energy Trading Week paths,
   and redirect all five `/events/` paths permanently.

Analytics configuration ownership is an implementation decision rather than a
content-scope choice: prefer deployment configuration unless stakeholders need
Payload to switch between already-approved container IDs. GTM tag
administration itself remains external.

## Phase gate decision

**Proceed with follow-up cleanup** for local parity implementation. Banners,
caption support, redirect review, search relevance review, People/Event corpus
acceptance, and the publishing matrix can progress without waiting for external
services. Do not declare feature parity or production readiness until:

- the remaining 244 plan-only owners complete migration and review;
- HubSpot, CookieYes, TIM, and consent-gated analytics pass their acceptance
  criteria;
- the production banner notification lifecycle passes;
- caption relationships and runtime tracks pass; and
- all authoritative route owners complete migration and review.

## Verification

The focused contract gate is:

```bash
corepack pnpm exec vitest run --config vitest.config.mts \
  tests/int/functional-parity-contract.int.spec.ts
```

It validates schema versioning, unique feature IDs, six-dimension completeness,
evidence references, resolved-decision/next-action discipline, the exact current
73/317 breakdown, and consistency with the retained 317-route inventory and
content architecture contract from immutable run
`people-events-inventory-20260805-1400`. Repository lint and typecheck remain
required after the catalogue is updated.

## Change control

Update the JSON, its evidence, this report, and the contract test together when
any feature status changes. A route-count or route-owner change additionally
requires the existing content-architecture decision and generated inventory
workflow; the functional catalogue must not edit that number on its own.
