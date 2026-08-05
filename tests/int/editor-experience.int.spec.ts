// @vitest-environment node

import { describe, expect, it } from 'vitest'

import { ContentSection, trayportLayoutBlocks } from '@/blocks/Trayport/config'
import { Pages } from '@/collections/Pages'
import { describeColumn, describeComponent, describeLayout } from '@/editor/describeLayout'
import { buildPresetFormState } from '@/editor/presetFormState'
import { createSectionFromPreset, getSectionPreset, sectionPresets } from '@/editor/sectionPresets'

type FieldNode = {
  admin?: Record<string, unknown>
  defaultValue?: unknown
  fields?: FieldNode[]
  name?: string
  type?: string
  tabs?: Array<{ fields?: FieldNode[] }>
}

const findField = (fields: FieldNode[], name: string): FieldNode | undefined => {
  for (const field of fields) {
    if (field.name === name) return field
    const nested = findField(field.fields || [], name)
    if (nested) return nested
    for (const tab of field.tabs || []) {
      const inTab = findField(tab.fields || [], name)
      if (inTab) return inTab
    }
  }
}

describe('Payload editor experience', () => {
  it('provides unique, non-destructive recipes that emit the existing contentSection contract', () => {
    expect(new Set(sectionPresets.map(({ key }) => key)).size).toBe(sectionPresets.length)
    expect(sectionPresets.length).toBeGreaterThanOrEqual(10)

    for (const preset of sectionPresets) {
      const section = preset.create()
      expect(section.blockType).toBe('contentSection')
      expect(section.columns.length).toBeGreaterThan(0)
      expect(section.columns.every((column) => column.components.length > 0)).toBe(true)
      expect(['reading', 'standard', 'wide', 'full']).toContain(section.width)
    }

    expect(getSectionPreset('marketMatrix').interactiveOnly).toBe(true)
    expect(createSectionFromPreset('textMedia').columns.map(({ span }) => span)).toEqual(['6', '6'])
  })

  it('builds the nested Payload row state needed to insert a preset without persisting metadata', () => {
    const state = buildPresetFormState(
      createSectionFromPreset('textMedia') as unknown as Record<string, unknown>,
    )

    expect(state.blockType).toBeUndefined()
    expect(state.columns?.value).toBe(2)
    expect(state.columns?.rows).toHaveLength(2)
    expect(state.columns?.rows?.every(({ collapsed }) => collapsed)).toBe(true)
    expect(state['columns.0.components']?.value).toBe(3)
    expect(state['columns.0.components']?.rows?.every(({ collapsed }) => collapsed)).toBe(true)
    expect(state['columns.0.components.0.blockType']?.value).toBe('heading')
    expect(state['columns.1.components.0.blockType']?.value).toBe('media')
    expect(String(state['columns.0.id']?.value)).toMatch(/^[a-f0-9]{24}$/)
  })

  it('describes collapsed rows using their editorial content and layout', () => {
    const section = createSectionFromPreset('textMedia')
    section.columns[0].components[0] = {
      appearance: 'h2',
      blockType: 'heading',
      level: 'h2',
      text: 'Why Trayport',
    }

    expect(describeLayout(section)).toBe('Why Trayport · 2 columns')
    expect(describeColumn(section.columns[0])).toBe('Heading — Why Trayport · 6/12')
    expect(describeComponent(section.columns[0].components[0])).toBe('Heading — Why Trayport')
  })

  it('puts content first while retaining uncommon layout controls in collapsed groups', () => {
    const fields = ContentSection.fields as FieldNode[]
    expect(fields[0]?.name).toBe('columns')
    expect(fields.slice(1).map(({ type }) => type)).toEqual(['collapsible', 'collapsible'])

    const columns = findField(fields, 'columns')
    expect(columns?.defaultValue).toEqual(
      expect.arrayContaining([expect.objectContaining({ span: '12' })]),
    )
    expect(columns?.admin?.components).toMatchObject({
      RowLabel: '@/components/AdminEditor/RowLabels.client#ColumnRowLabel',
    })

    const backgroundOpacity = findField(fields, 'backgroundOpacity')
    expect(backgroundOpacity?.admin?.condition).toBeTypeOf('function')
    expect(
      (backgroundOpacity?.admin?.condition as (data: unknown, sibling: unknown) => boolean)(
        {},
        { backgroundMedia: 1 },
      ),
    ).toBe(true)
  })

  it('registers a visual page-section launcher and block imagery', () => {
    const picker = findField(Pages.fields as FieldNode[], 'sectionPresetPicker')
    const layout = findField(Pages.fields as FieldNode[], 'layout')

    expect(picker).toMatchObject({
      type: 'ui',
      admin: {
        components: {
          Field: '@/components/AdminEditor/SectionPresetPicker.client',
        },
      },
    })
    expect(layout?.admin?.initCollapsed).toBe(true)
    expect(trayportLayoutBlocks.every((block) => Boolean(block.admin?.images?.thumbnail))).toBe(
      true,
    )
  })
})
