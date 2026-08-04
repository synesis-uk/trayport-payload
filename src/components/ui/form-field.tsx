import * as React from 'react'

import { Label } from '@/components/ui/label'
import { cn } from '@/utilities/ui'

type FieldControlProps = {
  'aria-describedby'?: string
  'aria-errormessage'?: string
  'aria-invalid'?: boolean | 'false' | 'true'
  disabled?: boolean
  id?: string
  name?: string
  required?: boolean
}

export interface FormFieldProps extends Omit<React.ComponentProps<'div'>, 'children'> {
  children: React.ReactElement<FieldControlProps>
  description?: React.ReactNode
  disabled?: boolean
  error?: React.ReactNode
  label: React.ReactNode
  name: string
  required?: boolean
}

const joinIDs = (...values: Array<string | undefined>) =>
  values.filter(Boolean).join(' ') || undefined

function FormField({
  children,
  className,
  description,
  disabled,
  error,
  id,
  label,
  name,
  required,
  ...props
}: FormFieldProps) {
  const controlID = id || `field-${name.replaceAll(/[^a-zA-Z0-9_-]/g, '-')}`
  const descriptionID = description ? `${controlID}-description` : undefined
  const errorID = error ? `${controlID}-error` : undefined
  const control = React.cloneElement(children, {
    'aria-describedby': joinIDs(children.props['aria-describedby'], descriptionID, errorID),
    'aria-errormessage': errorID,
    'aria-invalid': error ? true : children.props['aria-invalid'],
    disabled: disabled || children.props.disabled,
    id: controlID,
    name,
    required: required || children.props.required,
  })

  return (
    <div
      className={cn('grid gap-2', className)}
      data-disabled={disabled ? '' : undefined}
      data-invalid={error ? '' : undefined}
      data-slot="form-field"
      {...props}
    >
      <FormFieldLabel htmlFor={controlID}>
        {label}
        {required ? <span aria-hidden="true"> *</span> : null}
      </FormFieldLabel>
      {control}
      {description ? (
        <FormFieldDescription id={descriptionID}>{description}</FormFieldDescription>
      ) : null}
      {error ? <FormFieldError id={errorID}>{error}</FormFieldError> : null}
    </div>
  )
}

const FormFieldLabel: React.FC<React.ComponentProps<typeof Label>> = ({ className, ...props }) => (
  <Label className={cn('font-semibold', className)} data-slot="form-field-label" {...props} />
)

const FormFieldDescription: React.FC<React.ComponentProps<'p'>> = ({ className, ...props }) => (
  <p
    className={cn('m-0 text-sm/5 text-muted-foreground', className)}
    data-slot="form-field-description"
    {...props}
  />
)

const FormFieldError: React.FC<React.ComponentProps<'p'>> = ({ className, ...props }) => (
  <p
    className={cn('m-0 text-sm/5 font-medium text-destructive', className)}
    data-slot="form-field-error"
    role="alert"
    {...props}
  />
)

export { FormField, FormFieldDescription, FormFieldError, FormFieldLabel }
