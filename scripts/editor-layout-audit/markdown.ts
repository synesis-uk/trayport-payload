import type { CountEntry, SectionControlName, SectionUsageAudit } from './model'

const controlLabels: Record<SectionControlName, string> = {
  anchor: 'Anchor',
  backgroundMedia: 'Background media',
  backgroundOpacity: 'Background opacity',
  columnGap: 'Column gap',
  legacyAppearance: 'Legacy appearance',
  spacingBottom: 'Spacing below',
  spacingTop: 'Spacing above',
  surfacePadding: 'Surface padding',
  surfaceRadius: 'Surface radius',
  surfaceTone: 'Surface tone',
  width: 'Width',
  wrapperTheme: 'Wrapper theme',
}

const escapeCell = (value: string): string => value.replace(/\|/gu, '\\|').replace(/\r?\n/gu, ' ')

const examples = (values: string[]): string =>
  values.length ? values.map(escapeCell).join('; ') : '—'

const distribution = (entries: CountEntry[]): string =>
  entries.length
    ? entries
        .map(({ count, percentage, value }) => `${value}: ${count} (${percentage}%)`)
        .join('; ')
    : '—'

export const renderSectionUsageAuditMarkdown = (audit: SectionUsageAudit): string => {
  const lines = [
    '# Payload section usage audit',
    '',
    `Source: \`${audit.source}\``,
    '',
    'This is a deterministic, read-only inventory of page layout data. It records what exists; it does not change Payload content or infer that every imported combination should remain available to editors.',
    '',
    '## Summary',
    '',
    '| Measure | Count |',
    '| --- | ---: |',
    `| Input records | ${audit.summary.inputRecords} |`,
    `| Page documents | ${audit.summary.pageDocuments} |`,
    `| Pages with layout | ${audit.summary.pagesWithLayout} |`,
    `| Top-level blocks | ${audit.summary.topLevelBlocks} |`,
    `| Content sections | ${audit.summary.contentSections} |`,
    `| Columns | ${audit.summary.columns} |`,
    `| Nested components | ${audit.summary.components} |`,
    `| Empty sections | ${audit.summary.emptySections} |`,
    `| Empty columns | ${audit.summary.emptyColumns} |`,
    `| Ignored non-page records | ${audit.summary.ignoredRecords} |`,
    '',
    '## Section-level controls',
    '',
    '| Control | Observed values |',
    '| --- | --- |',
    ...Object.entries(audit.sectionControls).map(
      ([name, entries]) =>
        `| ${controlLabels[name as SectionControlName]} | ${escapeCell(distribution(entries))} |`,
    ),
    '',
    '## Column patterns',
    '',
    '| Pattern | Sections | Share | Examples |',
    '| --- | ---: | ---: | --- |',
    ...audit.columnPatterns.map(
      ({ count, examples: patternExamples, pattern, percentage }) =>
        `| ${escapeCell(pattern)} | ${count} | ${percentage}% | ${examples(patternExamples)} |`,
    ),
    '',
    '## Nested component types',
    '',
    '| Component | Occurrences | Share |',
    '| --- | ---: | ---: |',
    ...audit.componentTypes.map(
      ({ count, percentage, value }) => `| ${escapeCell(value)} | ${count} | ${percentage}% |`,
    ),
    '',
    '## Candidate section presets',
    '',
    'Each section is assigned to one candidate so the counts provide a conservative sizing baseline. A candidate is a design recommendation, not a data migration instruction.',
    '',
    '| Candidate | Sections | Share | Why | Examples |',
    '| --- | ---: | ---: | --- | --- |',
    ...audit.candidatePresets.map(
      ({ count, examples: presetExamples, label, percentage, rationale }) =>
        `| ${escapeCell(label)} | ${count} | ${percentage}% | ${escapeCell(rationale)} | ${examples(presetExamples)} |`,
    ),
    '',
    '## Page coverage',
    '',
    '| Page | Sections | Components | Top-level blocks |',
    '| --- | ---: | --- | --- |',
    ...audit.pages.map(
      ({ componentTypes, contentSections, label, topLevelBlocks }) =>
        `| ${escapeCell(label)} | ${contentSections} | ${escapeCell(componentTypes.join(', ') || '—')} | ${escapeCell(topLevelBlocks.join(', ') || '—')} |`,
    ),
  ]

  if (audit.warnings.length) {
    lines.push('', '## Follow-up flags', '')
    audit.warnings.forEach((warning) => lines.push(`- ${warning}`))
  }

  return `${lines.join('\n')}\n`
}
