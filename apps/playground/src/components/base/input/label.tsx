import type { ReactNode } from 'react'
import type { LabelProps as AriaLabelProps } from 'react-aria-components'
import { Label as AriaLabel } from 'react-aria-components'

import { cx } from '@/utils/cx'

interface LabelProps extends AriaLabelProps {
  children: ReactNode
  isInvalid?: boolean
  isRequired?: boolean
}

export function Label({
  isInvalid,
  isRequired,
  className,
  ...props
}: LabelProps) {
  return (
    <AriaLabel
      data-label="true"
      {...props}
      className={cx(
        'flex cursor-default items-center gap-0.5 text-sm font-medium text-secondary',
        className,
      )}
    >
      {props.children}
      <span
        className={cx(
          'hidden text-brand-tertiary',
          isRequired && 'block',
          typeof isRequired === 'undefined' && 'group-required:block',
          isInvalid && 'text-error-primary',
          typeof isInvalid === 'undefined' &&
            'group-invalid:text-error-primary',
        )}
      >
        *
      </span>
    </AriaLabel>
  )
}
