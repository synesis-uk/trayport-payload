import type { FormState } from 'payload'

type FormStateValue = Record<string, unknown>

const rowFieldNames = new Set(['actions', 'columns', 'components', 'items', 'statistics'])

const makeRowID = (): string => {
  const bytes = new Uint8Array(12)
  globalThis.crypto.getRandomValues(bytes)
  return Array.from(bytes, (byte) => byte.toString(16).padStart(2, '0')).join('')
}

const valueState = (value: unknown) => ({
  initialValue: value,
  passesCondition: true,
  valid: true,
  value,
})

const isRecord = (value: unknown): value is FormStateValue =>
  Boolean(value) && typeof value === 'object' && !Array.isArray(value)

const addRecord = (state: FormState, record: FormStateValue, prefix = ''): void => {
  for (const [name, value] of Object.entries(record)) {
    if (name === 'blockName' || name === 'blockType' || name === 'id' || value === undefined)
      continue

    const path = prefix ? `${prefix}.${name}` : name
    if (Array.isArray(value) && (rowFieldNames.has(name) || value.some(isRecord))) {
      const rows = value.map((entry) => {
        const candidate = isRecord(entry) ? entry : {}
        return {
          blockType: typeof candidate.blockType === 'string' ? candidate.blockType : undefined,
          collapsed: true,
          id: typeof candidate.id === 'string' ? candidate.id : makeRowID(),
        }
      })

      state[path] = {
        disableFormData: true,
        initialValue: rows.length,
        passesCondition: true,
        rows,
        valid: true,
        value: rows.length,
      }

      value.forEach((entry, index) => {
        const row = rows[index]
        state[`${path}.${index}.id`] = valueState(row.id)
        if (row.blockType) state[`${path}.${index}.blockType`] = valueState(row.blockType)
        if (isRecord(entry)) addRecord(state, entry, `${path}.${index}`)
      })
      continue
    }

    state[path] = valueState(value)
  }
}

/**
 * Payload's ADD_ROW action accepts a relative form-state fragment. Building it locally lets a
 * visual preset insert the existing contentSection block shape without a schema round-trip or a
 * new persisted preset discriminator.
 */
export const buildPresetFormState = (data: FormStateValue): FormState => {
  const state: FormState = {}
  addRecord(state, data)
  return state
}
