'use client'

import { useForm, useFormFields } from '@payloadcms/ui'
import { useMemo, useState } from 'react'

import { buildPresetFormState } from '@/editor/presetFormState'
import {
  createSectionFromPreset,
  sectionPresetGroups,
  sectionPresets,
  type SectionPresetDiagram,
  type SectionPresetKey,
} from '@/editor/sectionPresets'

import './admin-editor.scss'

const Diagram = ({ type }: { type: SectionPresetDiagram }) => (
  <span
    aria-hidden="true"
    className={`trayport-section-preset__diagram trayport-section-preset__diagram--${type}`}
  >
    <span />
    <span />
    <span />
  </span>
)

export const SectionPresetPicker = () => {
  const { addFieldRow, disabled } = useForm()
  const pageType = useFormFields(([fields]) => fields.pageType?.value)
  const rowCount = useFormFields(([fields]) => fields.layout?.rows?.length || 0)
  const [announcement, setAnnouncement] = useState('')

  const available = useMemo(
    () => sectionPresets.filter((preset) => !preset.interactiveOnly || pageType === 'interactive'),
    [pageType],
  )

  const addPreset = (key: SectionPresetKey) => {
    const preset = sectionPresets.find((candidate) => candidate.key === key)
    if (!preset || disabled) return

    const section = createSectionFromPreset(key)
    addFieldRow({
      blockType: 'contentSection',
      path: 'layout',
      rowIndex: rowCount,
      schemaPath: 'pages.layout',
      subFieldState: buildPresetFormState(section as unknown as Record<string, unknown>),
    })
    setAnnouncement(`${preset.label} added as section ${rowCount + 1}.`)

    window.setTimeout(() => {
      document.getElementById(`layout-row-${rowCount}`)?.scrollIntoView({
        behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth',
        block: 'center',
      })
    }, 0)
  }

  return (
    <section aria-labelledby="trayport-section-picker-title" className="trayport-section-picker">
      <div className="trayport-section-picker__intro">
        <p className="trayport-admin-eyebrow">Page builder</p>
        <h3 id="trayport-section-picker-title">Add a content section</h3>
        <p>
          Start with a Trayport-approved pattern. Content, columns and safe layout defaults are
          created for you.
        </p>
      </div>

      {sectionPresetGroups.map((group) => {
        const presets = available.filter((preset) => preset.category === group.key)
        if (!presets.length) return null
        return (
          <div className="trayport-section-picker__group" key={group.key}>
            <h4>{group.label}</h4>
            <div className="trayport-section-picker__grid">
              {presets.map((preset) => (
                <button
                  className="trayport-section-preset"
                  disabled={disabled}
                  key={preset.key}
                  onClick={() => addPreset(preset.key)}
                  type="button"
                >
                  <Diagram type={preset.diagram} />
                  <span className="trayport-section-preset__copy">
                    <strong>{preset.label}</strong>
                    <span>{preset.description}</span>
                  </span>
                  <span aria-hidden="true" className="trayport-section-preset__add">
                    +
                  </span>
                </button>
              ))}
            </div>
          </div>
        )
      })}

      <p aria-live="polite" className="trayport-section-picker__announcement">
        {announcement}
      </p>
    </section>
  )
}

export default SectionPresetPicker
