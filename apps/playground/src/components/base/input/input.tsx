import type { ReactNode } from 'react'
import type {
  InputProps as AriaInputProps,
  TextFieldProps as AriaTextFieldProps,
} from 'react-aria-components'
import {
  Input as AriaInput,
  TextField as AriaTextField,
} from 'react-aria-components'

import { HintText } from './hint-text'
import { Label } from './label'

import { cx } from '@/utils/cx'

interface InputProps extends AriaTextFieldProps {
  hint?: ReactNode
  inputClassName?: string
  label?: string
  placeholder?: string
  type?: AriaInputProps['type']
}

export function Input({
  className,
  hint,
  inputClassName,
  label,
  placeholder,
  type = 'text',
  ...props
}: InputProps) {
  return (
    <AriaTextField
      aria-label={!label ? placeholder : undefined}
      {...props}
      className={(state) =>
        cx(
          'group flex h-max w-full flex-col items-start gap-1.5',
          typeof className === 'function' ? className(state) : className,
        )
      }
    >
      {({ isInvalid, isRequired }) => (
        <>
          {label ? (
            <Label isInvalid={isInvalid} isRequired={isRequired}>
              {label}
            </Label>
          ) : null}
          <AriaInput
            placeholder={placeholder}
            type={type}
            className={cx(
              'm-0 w-full rounded-lg bg-primary px-3.5 py-2.5 text-md text-primary shadow-xs ring-1 ring-primary ring-inset outline-hidden transition duration-100 ease-linear placeholder:text-placeholder focus:ring-2 focus:ring-brand disabled:cursor-not-allowed disabled:opacity-50 group-invalid:ring-error_subtle group-invalid:focus:ring-2 group-invalid:focus:ring-error',
              inputClassName,
            )}
          />
          {hint ? <HintText isInvalid={isInvalid}>{hint}</HintText> : null}
        </>
      )}
    </AriaTextField>
  )
}
