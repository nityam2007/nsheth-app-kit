import { cx } from '@/utils/cx'

import type { ComponentPropsWithoutRef } from 'react'

export function Container({
  className,
  ...props
}: ComponentPropsWithoutRef<'div'>) {
  return (
    <div
      className={cx(
        'mx-auto w-full max-w-container px-4 sm:px-6 lg:px-8',
        className,
      )}
      {...props}
    />
  )
}
