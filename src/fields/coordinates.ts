import type { GroupField } from 'payload'

type CoordinatesFieldOptions = {
  label?: string
  name?: string
  required?: boolean
}

export const coordinatesField = ({
  label = 'Coordinates',
  name = 'coordinates',
  required = false,
}: CoordinatesFieldOptions = {}): GroupField => ({
  name,
  type: 'group',
  label,
  fields: [
    {
      name: 'latitude',
      type: 'number',
      max: 90,
      min: -90,
      required,
    },
    {
      name: 'longitude',
      type: 'number',
      max: 180,
      min: -180,
      required,
    },
  ],
})
