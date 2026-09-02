import { useId } from 'react'

import type { ComponentPropsWithoutRef } from 'react'

type FieldProps = ComponentPropsWithoutRef<'input'> & {
  error?: string
  hint?: string
  label: string
}

export function Field({
  'aria-describedby': ariaDescribedBy,
  'aria-invalid': ariaInvalid,
  className,
  error,
  hint,
  id,
  label,
  ...props
}: FieldProps) {
  const generatedId = useId()
  const fieldId = id ?? generatedId
  const hintId = hint ? `${fieldId}-hint` : undefined
  const errorId = error ? `${fieldId}-error` : undefined
  const describedBy = [ariaDescribedBy, hintId, errorId]
    .filter(Boolean)
    .join(' ')

  return (
    <div className="ns-field">
      <label className="ns-field__label" htmlFor={fieldId}>
        {label}
      </label>
      <input
        aria-describedby={describedBy || undefined}
        aria-invalid={error ? true : ariaInvalid}
        className={['ns-field__control', className].filter(Boolean).join(' ')}
        id={fieldId}
        {...props}
      />
      {hint ? (
        <p className="ns-field__hint" id={hintId}>
          {hint}
        </p>
      ) : null}
      {error ? (
        <p className="ns-field__error" id={errorId}>
          {error}
        </p>
      ) : null}
    </div>
  )
}
