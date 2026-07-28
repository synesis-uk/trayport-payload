import type { DateField } from 'payload'

export const publishedAtField = (): DateField => ({
  name: 'publishedAt',
  type: 'date',
  admin: {
    date: {
      pickerAppearance: 'dayAndTime',
    },
    position: 'sidebar',
  },
  hooks: {
    beforeChange: [
      ({ siblingData, value }) => {
        if (siblingData?._status === 'published' && !value) {
          return new Date().toISOString()
        }

        return value
      },
    ],
  },
})
