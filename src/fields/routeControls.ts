import type { CheckboxField } from 'payload'

type RouteControlsOptions = {
  condition?: NonNullable<CheckboxField['admin']>['condition']
}

export const confirmPathRedirectField = ({
  condition,
}: RouteControlsOptions = {}): CheckboxField => ({
  name: 'confirmPathRedirect',
  type: 'checkbox',
  virtual: true,
  admin: {
    condition,
    description:
      'Check this before publishing or scheduling a change to an already-live path. Approval is retained for that exact old/new path pair, and the former path becomes a permanent redirect.',
    position: 'sidebar',
  },
  defaultValue: false,
  label: 'Confirm redirect on path change',
})
