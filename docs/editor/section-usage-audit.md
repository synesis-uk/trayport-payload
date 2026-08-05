# Payload section usage audit

Status: accepted implementation baseline

This audit records the section structures already present in transformed Payload page content. It is the evidence for simplifying the page editor without deleting capabilities or changing the stored `contentSection` shape.

The accepted baseline was generated from:

- Run: `banner-route-table-semantics-20260805`
- Artifact: `migration/work/banner-route-table-semantics-20260805/transformed.ndjson`
- Accepted artifact SHA-256: `3a61f1dd2a01e8744106bc3c6733935f8bf12748c70012cdc9e84921769cf6a3`

The work artifact is intentionally Git-ignored. The audit utility and this retained result are committed; the source can be regenerated through the migration workflow.

## How to run the audit

The command is deterministic, read-only, and does not require Payload or PostgreSQL to be running:

```bash
corepack pnpm exec tsx scripts/editor-layout-audit.ts \
  --input migration/work/banner-route-table-semantics-20260805/transformed.ndjson \
  --format markdown \
  --source "accepted transformed content: banner-route-table-semantics-20260805"
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
| Input transformed records | 471 |
| Page documents | 26 |
| Pages with layout | 26 |
| Top-level blocks | 164 |
| Content sections | 135 |
| Columns | 208 |
| Nested components | 382 |
| Empty sections | 0 |
| Empty columns | 0 |
| Ignored non-page records | 445 |

The top-level blocks are 135 content sections, 26 heroes, two article listings, and one learning-video listing.

## Section controls

| Editor control | Observed use | Implementation implication |
| --- | --- | --- |
| Anchor | Set on 26 sections (19.3%) | Keep available, but do not place before content. Put under organisation/advanced settings. |
| Surface tone | None 62.2%, white 30.4%, dark 7.4% | Presets should choose the tone. Retain a small visual tone choice in Appearance. |
| Wrapper theme | None 88.9%; all coloured treatments 11.1% | Default and hide in Advanced for the normal path. |
| Background media | Set twice (1.5%) | Hide behind an explicit “Add background image” action. |
| Background opacity | Non-default twice (1.5%) | Only show when background media is set. |
| Surface radius | Default 92.6%, extra-large 7.4% | Presets should own this; keep the override in Advanced. |
| Surface padding | None 91.9%, medium 8.1% | Presets should own this; keep the override in Advanced. |
| Width | Wide 63.7%, reading 29.6%, standard 6.7% | Width is meaningful but should normally be selected by the preset. A compact visual override is justified. |
| Spacing above | Regular 55.6%, tight 37%, large 7.4% | Expose a simple compact/standard/spacious treatment; independent values belong in Advanced. |
| Spacing below | Regular 57%, tight 36.3%, large 6.7% | Use the same treatment as spacing above, with independent override in Advanced. |
| Column gap | Regular 96.3%, tight 3.7% | Default it and hide it in Advanced. |

This supports the proposed content-first ordering: columns and components, Appearance, Advanced layout, then anchor and technical settings.

## Column-pattern evidence

| Pattern | Sections | Share |
| --- | ---: | ---: |
| `12` | 83 | 61.5% |
| `6 + 6` | 27 | 20% |
| `6` | 8 | 5.9% |
| All other patterns combined | 17 | 12.6% |

Single-column and equal two-column structures account for 81.5% of all sections. They should be the dominant choices in the visual picker. The remaining patterns include `8 + 4`, `4 + 8`, repeated feature-card spans, and complex imported sections that combine several visual rows inside one stored section.

The complex patterns must remain editable. They should not define the ordinary add-section workflow, and they must not be destructively rewritten merely to fit a preset.

## Component evidence

| Component | Occurrences | Share of nested components |
| --- | ---: | ---: |
| Heading | 122 | 31.9% |
| Rich text | 95 | 24.9% |
| Feature list | 31 | 8.1% |
| Media | 31 | 8.1% |
| Actions | 30 | 7.9% |
| Divider | 26 | 6.8% |
| Market coverage | 13 | 3.4% |
| Office | 8 | 2.1% |
| FAQ | 7 | 1.8% |
| Data chart | 6 | 1.6% |
| Entity list | 3 | 0.8% |
| Standalone icon | 3 | 0.8% |
| Data table | 2 | 0.5% |
| Checklist | 1 | 0.3% |
| Lifecycle | 1 | 0.3% |
| Market matrix | 1 | 0.3% |
| Statistics | 1 | 0.3% |
| Timeline | 1 | 0.3% |

Heading, rich text, actions, and media represent 72.8% of nested components. Their insertion and editing paths should therefore receive the strongest visual priority. Specialist components should remain discoverable through clearly labelled groups rather than appearing in one flat list.

## Candidate preset sizing

The audit assigns each section to one candidate using conservative, mutually exclusive rules. This sizes the likely workflow; it does not mark content for automatic migration.

| Candidate preset | Sections | Share |
| --- | ---: | ---: |
| Intro text | 47 | 34.8% |
| Feature grid | 22 | 16.3% |
| Text and media | 13 | 9.6% |
| Text with actions | 11 | 8.1% |
| Market coverage map | 10 | 7.4% |
| FAQ | 7 | 5.2% |
| Chart or data table | 6 | 4.4% |
| Market matrix | 1 | 0.7% |
| Statistics | 1 | 0.7% |
| Media and text | 1 | 0.7% |
| Call-to-action band | 1 | 0.7% |
| Media gallery | 0 | 0% |
| Advanced custom section | 15 | 11.1% |

The named candidates cover 88.9% of existing sections. The initial picker should therefore include:

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

Media gallery has no observed occurrence in the accepted pages, so it does not need a first-tier shortcut. It remains available as a component. The 15 advanced sections include mixed and specialist compositions such as offices, timeline content, and multiple visual rows within one stored section; these need human review before another preset is introduced.

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

This baseline covers the 26 accepted imported Pages, not all 297 routes in the production inventory and not future editor-created content. Candidate classification is structural and intentionally conservative. Before removing a control or introducing a destructive data migration, rerun the audit against a current Payload export and visually inspect the advanced/custom sections.

The editor-experience slice can proceed when it preserves these records, exposes the common preset path, and leaves public rendering unchanged for untouched pages.
