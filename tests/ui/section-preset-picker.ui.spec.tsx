import { fireEvent, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

const mocks = vi.hoisted(() => ({
  addFieldRow: vi.fn(),
  fields: {
    layout: { rows: [] as unknown[] },
    pageType: { value: 'standard' },
  },
}))

vi.mock('@payloadcms/ui', () => ({
  useForm: () => ({ addFieldRow: mocks.addFieldRow, disabled: false }),
  useFormFields: (selector: (context: unknown[]) => unknown) => selector([mocks.fields, vi.fn()]),
}))

import { SectionPresetPicker } from '@/components/AdminEditor/SectionPresetPicker.client'

describe('section preset picker', () => {
  beforeEach(() => {
    mocks.addFieldRow.mockReset()
    mocks.fields.layout.rows = []
    mocks.fields.pageType.value = 'standard'
  })

  afterEach(() => {
    vi.restoreAllMocks()
    vi.useRealTimers()
  })

  it('adds a composed contentSection form-state row in one action', () => {
    render(<SectionPresetPicker />)

    fireEvent.click(screen.getByRole('button', { name: /Text and media/i }))

    expect(mocks.addFieldRow).toHaveBeenCalledTimes(1)
    expect(mocks.addFieldRow).toHaveBeenCalledWith(
      expect.objectContaining({
        blockType: 'contentSection',
        path: 'layout',
        rowIndex: 0,
        schemaPath: 'pages.layout',
        subFieldState: expect.objectContaining({
          columns: expect.objectContaining({ value: 2 }),
          'columns.0.components': expect.objectContaining({ value: 3 }),
        }),
      }),
    )
    expect(screen.getByText(/Text and media added as section 1/i)).toBeTruthy()
  })

  it('only offers the matrix recipe for interactive pages', () => {
    const { rerender } = render(<SectionPresetPicker />)
    expect(screen.queryByRole('button', { name: /Market matrix/i })).toBeNull()

    mocks.fields.pageType.value = 'interactive'
    rerender(<SectionPresetPicker />)
    expect(screen.getByRole('button', { name: /Market matrix/i })).toBeTruthy()
  })

  it("scrolls to Payload's zero-based row id after insertion", () => {
    vi.useFakeTimers()
    mocks.fields.layout.rows = [{}]
    const getElementById = vi.spyOn(document, 'getElementById').mockReturnValue(null)

    render(<SectionPresetPicker />)
    fireEvent.click(screen.getByRole('button', { name: /Introductory text/i }))
    vi.runAllTimers()

    expect(getElementById).toHaveBeenLastCalledWith('layout-row-1')
  })
})
