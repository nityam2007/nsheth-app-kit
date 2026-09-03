import type { ReactNode } from 'react'
import type { TextProps as AriaTextProps } from 'react-aria-components'
import { Text as AriaText } from 'react-aria-components'

import { cx } from '@/utils/cx'

interface HintTextProps extends AriaTextProps {
  children: ReactNode
  isInvalid?: boolean
  size?: 'sm' | 'md'
}

export function HintText({
  isInvalid,
  className,
  size = 'md',
  ...props
}: HintTextProps) {
  return (
    <AriaText
      {...props}
      slot={isInvalid ? 'errorMessage' : 'description'}
      className={cx(
        'text-sm text-tertiary',
        size === 'sm' && 'text-xs',
        isInvalid && 'text-error-primary',
        'group-invalid:text-error-primary',
        className,
      )}
    />
  )
}
