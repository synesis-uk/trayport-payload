# Payload section usage audit

Status: accepted implementation baseline

This audit records the section structures already present in transformed Payload page content. It is the evidence for simplifying the page editor without deleting capabilities or changing the stored `contentSection` shape.

The accepted baseline was generated from:

- Run: `slices-01456-final-map-defaults-20260805`
- Artifact: `migration/work/slices-01456-final-map-defaults-20260805/transformed.ndjson`
- Accepted artifact SHA-256: `f3c8a017754a8ab9a169c3ed116e988b03e2bae83eec5aaef3bc11963db56dc1`

The work artifact is intentionally Git-ignored. The audit utility and this retained result are committed; the source can be regenerated through the migration workflow.

## How to run the audit

The command is deterministic, read-only, and does not require Payload or PostgreSQL to be running:

```bash
corepack pnpm exec tsx scripts/editor-layout-audit.ts \
  --input migration/work/slices-01456-final-map-defaults-20260805/transformed.ndjson \
  --format markdown \
  --source "accepted transformed content: slices-01456-final-map-defaults-20260805"
```

Use `--format json` for machine-readable output. The input may be:

- Migration `transformed.ndjson` containing mixed target collections.
- A JSON array of Payload page documents.
- A Payload REST/Local API response shaped as `{ "docs": [...] }`.
- One page document.
- Standard input, using `--input -`.

Records with an explicit target other than `pages` are ignored. Direct documents are included when they have a `layout` array. No input record is modified.

## Accepted baseline summary

| Measure | Count |
| --- | ---: |
| Input transformed records | 453 |
| Page documents | 21 |
| Pages with layout | 21 |
| Top-level blocks | 138 |
| Content sections | 114 |
| Columns | 179 |
| Nested components | 306 |
| Empty sections | 0 |
| Empty columns | 0 |
| Ignored non-page records | 432 |

The top-level blocks are 114 content sections, 21 heroes, two article listings, and one learning-video listing.

## Section controls

| Editor control | Observed use | Implementation implication |
| --- | --- | --- |
| Anchor | Set on 23 sections (20.2%) | Keep available, but do not place before content. Put under organisation/advanced settings. |
| Surface tone | None 58.8%, white 36%, dark 5.3% | Presets should choose the tone. Retain a small visual tone choice in Appearance. |
| Wrapper theme | None 90.4%; all coloured treatments 9.6% | Default and hide in Advanced for the normal path. |
| Background media | Set once (0.9%) | Hide behind an explicit “Add background image” action. |
| Background opacity | Non-default once (0.9%) | Only show when background media is set. |
| Surface radius | Default 93.9%, extra-large 6.1% | Presets should own this; keep the override in Advanced. |
| Surface padding | None 93.9%, medium 6.1% | Presets should own this; keep the override in Advanced. |
| Width | Wide 59.6%, reading 35.1%, standard 5.3% | Width is meaningful but should normally be selected by the preset. A compact visual override is justified. |
| Spacing above | Regular 49.1%, tight 43%, large 7.9% | Expose a simple compact/standard/spacious treatment; independent values belong in Advanced. |
| Spacing below | Regular 50.9%, tight 42.1%, large 7% | Use the same treatment as spacing above, with independent override in Advanced. |
| Column gap | Regular 95.6%, tight 4.4% | Default it and hide it in Advanced. |

This supports the proposed content-first ordering: columns and components, Appearance, Advanced layout, then anchor and technical settings.

## Column-pattern evidence

| Pattern | Sections | Share |
| --- | ---: | ---: |
| `12` | 69 | 60.5% |
| `6 + 6` | 21 | 18.4% |
| `6` | 8 | 7% |
| All other patterns combined | 16 | 14% |

Single-column and equal two-column structures account for 78.9% of all sections. They should be the dominant choices in the visual picker. The remaining patterns include `8 + 4`, `4 + 8`, repeated feature-card spans, and complex imported sections that combine several visual rows inside one stored section.

The complex patterns must remain editable. They should not define the ordinary add-section workflow, and they must not be destructively rewritten merely to fit a preset.

## Component evidence

| Component | Occurrences | Share of nested components |
| --- | ---: | ---: |
| Heading | 96 | 31.4% |
| Rich text | 74 | 24.2% |
| Actions | 26 | 8.5% |
| Media | 25 | 8.2% |
| Divider | 24 | 7.8% |
| Feature list | 19 | 6.2% |
| Market coverage | 12 | 3.9% |
| Office | 8 | 2.6% |
| Data chart | 6 | 2% |
| FAQ | 6 | 2% |
| Entity list | 3 | 1% |
| Standalone icon | 3 | 1% |
| Data table | 1 | 0.3% |
| Market matrix | 1 | 0.3% |
| Statistics | 1 | 0.3% |
| Timeline | 1 | 0.3% |

Heading, rich text, actions, and media represent 72.3% of nested components. Their insertion and editing paths should therefore receive the strongest visual priority. Specialist components should remain discoverable through clearly labelled groups rather than appearing in one flat list.

## Candidate preset sizing

The audit assigns each section to one candidate using conservative, mutually exclusive rules. This sizes the likely workflow; it does not mark content for automatic migration.

| Candidate preset | Sections | Share |
| --- | ---: | ---: |
| Intro text | 42 | 36.8% |
| Feature grid | 18 | 15.8% |
| Text with actions | 10 | 8.8% |
| Market coverage map | 9 | 7.9% |
| Text and media | 9 | 7.9% |
| FAQ | 6 | 5.3% |
| Chart or data table | 5 | 4.4% |
| Market matrix | 1 | 0.9% |
| Statistics | 1 | 0.9% |
| Media and text | 1 | 0.9% |
| Call-to-action band | 1 | 0.9% |
| Media gallery | 0 | 0% |
| Advanced custom section | 11 | 9.6% |

The named candidates cover 90.4% of existing sections. The initial picker should therefore include:

1. Intro text.
2. Text with actions.
3. Text and media, with an orientation choice instead of two unrelated concepts.
4. Feature grid.
5. Call-to-action band.
6. Statistics.
7. FAQ.
8. Chart or data table.
9. Market coverage map.
10. Market matrix.
11. Blank advanced section.

Media gallery has no observed occurrence in the accepted pages, so it does not need a first-tier shortcut. It remains available as a component. The 11 advanced sections include mixed and specialist compositions such as offices, timeline content, and multiple visual rows within one stored section; these need human review before another preset is introduced.

## Implementation constraints established by the audit

- Presets must emit the existing `contentSection.columns.components` structure. A selected preset is not stored as a new content dependency.
- Existing pages must open and save without being converted to a preset.
- Uncommon controls should be defaulted, conditioned, or moved to Advanced—not removed from the schema.
- Background opacity must be conditional on background media.
- The picker must create at least one non-empty column, and normal presets must create useful starter components.
- `12` and `6 + 6` should be the clearest visual layout choices.
- Width and spacing must remain bounded design-system choices rather than arbitrary CSS values.
- Specialist map, chart, matrix, office, and timeline content must remain recognisable in collapsed-row labels even where no dedicated preset is initially provided.

## Limits and review gate

This baseline covers the 21 accepted imported pages, not all 296 routes in the production inventory and not future editor-created content. Candidate classification is structural and intentionally conservative. Before removing a control or introducing a destructive data migration, rerun the audit against a current Payload export and visually inspect the advanced/custom sections.

The editor-experience slice can proceed when it preserves these records, exposes the common preset path, and leaves public rendering unchanged for untouched pages.
