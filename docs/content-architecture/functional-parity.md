# Functional parity audit

## Audit outcome

**Partially complete.** The source feature baseline is substantially understood,
but target parity and launch verification are not complete. The accepted runtime
position is **34 of 297 route owners (11.4%)**: 31 rendered Payload documents, one
managed redirect owner, and two virtual indexes. The other 263 owners remain
plan-only.

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
   297 owners, but only 34 are in the accepted runtime slice. Complete article,
   hub, venue, and Learning Hub detail ownership, managed links, media, SEO, and
   review evidence remains outstanding for 263 owners.
2. **Launch integrations are not implemented.** HubSpot and CookieYes are
   accepted but deferred. TIM is also deferred and remains a launch requirement.
   Analytics is missing: the audited `GTM-P8HWX2S` container has no consent-gated
   Next.js runtime or network acceptance.
3. **Scheduled banner parity is partial.** The new target models content, dates,
   page targeting, placement, priority, page rendering, migration transforms,
   and the four-event notification task. The accepted source run extracted and
   loaded all four banners plus five dependent Pages and referenced media with no
   unresolved relationships. Desktop and mobile browser placement, targeting,
   link, and dismissal acceptance pass; production scheduler/SMTP recipient
   acceptance remains open.
4. **Video caption support is missing.** The source audit found 32 MP4
   dependencies and one SRT dependency, while Payload has no subtitle-track
   model, migration mapping, `<track>` runtime, or acceptance test.

### Medium

1. **Search currently overclaims its scope.** The live modal uses Relevanssi and
   a results flow across site content; the target modal sends users to an
   Insights-only filter. A product decision is required before either a
   whole-site index or an intentionally narrower search can be accepted.
2. **Redirect migration is incomplete.** WordPress has 50 published rules (49
   permanent and one temporary); the accepted target has one ordinary legacy
   rule plus the Request A Demo route owner. Known duplicate, missing-target,
   private-target, loop/chain, and shadowing cases still need disposition.
3. **Live People and Event behavior needs scope decisions.** Nine live People
   detail links have no target route owner. Event content is split between core
   `/event/` posts and a separate `/events/` CPT with two redirects across the
   namespaces.
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

- The approved route corpus is now 297 after the published banner exposed the
  previously undiscovered EEX News Page; the Commodities Report remains
  excluded.
- Production readiness remains blocked.
- HubSpot, CookieYes, and TIM remain outside the completed local slice.

### New or newly explicit risks

- The catalogue is a reviewed snapshot, not automatic proof that its evidence
  still behaves correctly. Any feature implementation must update its status
  and strengthen behavior tests in the same change.
- The live banner extract proves four records and their dependencies, but its
  source-specific recipients require the explicit Payload user review workflow
  before live notification delivery can be accepted.
- The delivery ledger prevents concurrent/rescheduled duplicates and retries
  recorded SMTP failures, but SMTP has no idempotency key. A process crash after
  SMTP accepts a message and before the ledger records it can produce one
  duplicate when the stale lease is recovered; production monitoring must make
  that rare ambiguity visible.
- Search, People, and Event decisions can change schema and route scope; they
  must be resolved before full-corpus migration is sealed.

## Updated scorecard

The catalogue contains 20 features: 3 complete, 8 partial, 2 missing, 3
deferred, 3 decision-required, and 1 excluded.

| Dimension | Current assessment |
| --- | --- |
| Source | 18 complete; 2 partial |
| Schema | 12 complete; 2 partial; 3 missing; 2 decision; 1 excluded |
| Editor | 11 complete; 3 partial; 3 missing; 1 decision; 2 excluded |
| Runtime | 7 complete; 6 partial; 3 missing; 3 deferred; 1 excluded |
| Migration | 5 complete; 9 partial; 2 missing; 1 deferred; 1 decision; 2 excluded |
| Verification | 4 complete; 10 partial; 3 missing; 2 deferred; 1 decision |

Status is assessed against each feature's stated boundary. In particular,
“complete” for maps, Matrix, and charts means their agreed local slice is
complete; production-like volume, provider configuration, licensing, and UAT
remain release gates.

## Decision queue

These decisions now require stakeholder input before their affected
implementation can be completed:

1. **Search:** reproduce whole-site Relevanssi behavior, or intentionally ship
   an Insights-only search with accurate naming and UX?
2. **People:** retain nine public detail routes, replace them with embedded
   profiles, or remove/redirect the live links?
3. **Events:** merge the separate Events CPT into Article events, exclude it as
   dormant, or model it independently; and is `/event/` or `/events/`
   canonical?

Analytics configuration ownership is an implementation decision rather than a
content-scope choice: prefer deployment configuration unless stakeholders need
Payload to switch between already-approved container IDs. GTM tag
administration itself remains external.

## Phase gate decision

**Proceed with follow-up cleanup** for local parity implementation. Banners,
caption support, redirect review, and the publishing matrix can progress without
waiting for external services. Do not declare feature parity or production
readiness until:

- the three decision-queue items are resolved;
- HubSpot, CookieYes, TIM, and consent-gated analytics pass their acceptance
  criteria;
- the production banner notification lifecycle passes;
- caption relationships and runtime tracks pass; and
- all 297 owners complete migration and review.

## Verification

The focused contract gate is:

```bash
corepack pnpm exec vitest run --config vitest.config.mts \
  tests/int/functional-parity-contract.int.spec.ts
```

It validates schema versioning, unique feature IDs, six-dimension completeness,
evidence references, decision/next-action discipline, the exact 34/297
breakdown, and consistency with the existing 297-route inventory and content
architecture contract. Repository lint and typecheck remain required after the
catalogue is updated.

## Change control

Update the JSON, its evidence, this report, and the contract test together when
any feature status changes. A route-count or route-owner change additionally
requires the existing content-architecture decision and generated inventory
workflow; the functional catalogue must not edit that number on its own.
