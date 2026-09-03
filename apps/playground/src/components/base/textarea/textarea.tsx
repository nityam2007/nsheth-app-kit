import type { ReactNode } from 'react'
import type {
  TextAreaProps as AriaTextAreaProps,
  TextFieldProps as AriaTextFieldProps,
} from 'react-aria-components'
import {
  TextArea as AriaTextArea,
  TextField as AriaTextField,
} from 'react-aria-components'

import { HintText } from '../input/hint-text'
import { Label } from '../input/label'

import { cx } from '@/utils/cx'

interface TextAreaProps extends AriaTextFieldProps {
  cols?: number
  hint?: ReactNode
  label?: string
  placeholder?: string
  rows?: number
  textAreaClassName?: AriaTextAreaProps['className']
}

export function TextArea({
  className,
  cols,
  hint,
  label,
  placeholder,
  rows,
  textAreaClassName,
  ...props
}: TextAreaProps) {
  return (
    <AriaTextField
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
          <AriaTextArea
            cols={cols}
            placeholder={placeholder}
            rows={rows}
            className={(state) =>
              cx(
                'w-full rounded-lg bg-primary px-3.5 py-3 text-md text-primary shadow-xs ring-1 ring-primary ring-inset outline-hidden transition duration-100 ease-linear placeholder:text-placeholder focus:ring-2 focus:ring-brand disabled:cursor-not-allowed disabled:opacity-50',
                state.isInvalid && 'ring-error_subtle',
                state.isInvalid && state.isFocused && 'ring-2 ring-error',
                typeof textAreaClassName === 'function'
                  ? textAreaClassName(state)
                  : textAreaClassName,
              )
            }
          />
          {hint ? <HintText isInvalid={isInvalid}>{hint}</HintText> : null}
        </>
      )}
    </AriaTextField>
  )
}
