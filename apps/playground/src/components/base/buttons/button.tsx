import { isValidElement } from 'react'
import type { FC, ReactNode, SVGProps } from 'react'
import type { ButtonProps as AriaButtonProps } from 'react-aria-components'
import { Button as AriaButton } from 'react-aria-components'

import { cx, sortCx } from '@/utils/cx'

const styles = sortCx({
  common:
    'group relative inline-flex h-max cursor-pointer items-center justify-center whitespace-nowrap outline-brand transition duration-100 ease-linear focus-visible:outline-2 focus-visible:outline-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
  sizes: {
    sm: 'gap-1 rounded-lg px-3 py-2 text-sm font-semibold',
    md: 'gap-1 rounded-lg px-3.5 py-2.5 text-sm font-semibold',
    lg: 'gap-1.5 rounded-lg px-4 py-2.5 text-md font-semibold',
  },
  colors: {
    primary:
      'bg-brand-solid text-white shadow-xs-skeuomorphic ring-1 ring-transparent ring-inset hover:bg-brand-solid_hover',
    secondary:
      'bg-primary text-secondary shadow-xs-skeuomorphic ring-1 ring-primary ring-inset hover:bg-primary_hover hover:text-secondary_hover',
    tertiary: 'text-tertiary hover:bg-primary_hover hover:text-tertiary_hover',
  },
})

type Icon = FC<SVGProps<SVGSVGElement>> | ReactNode

interface ButtonProps extends Omit<
  AriaButtonProps,
  'children' | 'className' | 'isDisabled' | 'isPending'
> {
  children?: ReactNode
  className?: string
  color?: keyof typeof styles.colors
  iconLeading?: Icon
  iconTrailing?: Icon
  isDisabled?: boolean
  isLoading?: boolean
  showTextWhileLoading?: boolean
  size?: keyof typeof styles.sizes
}

export function Button({
  children,
  className,
  color = 'primary',
  iconLeading: IconLeading,
  iconTrailing: IconTrailing,
  isDisabled,
  isLoading,
  showTextWhileLoading,
  size = 'sm',
  ...props
}: ButtonProps) {
  const iconClassName = 'pointer-events-none size-5 shrink-0'

  return (
    <AriaButton
      {...props}
      isDisabled={isDisabled}
      isPending={isLoading}
      className={cx(
        styles.common,
        styles.sizes[size],
        styles.colors[color],
        className,
      )}
    >
      {isValidElement(IconLeading) ? IconLeading : null}
      {typeof IconLeading === 'function' ? (
        <IconLeading data-icon="leading" className={iconClassName} />
      ) : null}
      {isLoading ? (
        <svg
          aria-hidden="true"
          className={cx(
            iconClassName,
            'animate-spin',
            !showTextWhileLoading && 'absolute',
          )}
          fill="none"
          viewBox="0 0 20 20"
        >
          <circle
            className="stroke-current opacity-30"
            cx="10"
            cy="10"
            r="8"
            strokeWidth="2"
          />
          <circle
            className="origin-center stroke-current"
            cx="10"
            cy="10"
            r="8"
            strokeDasharray="12.5 50"
            strokeLinecap="round"
            strokeWidth="2"
          />
        </svg>
      ) : null}
      {children ? (
        <span className={cx(isLoading && !showTextWhileLoading && 'invisible')}>
          {children}
        </span>
      ) : null}
      {isValidElement(IconTrailing) ? IconTrailing : null}
      {typeof IconTrailing === 'function' ? (
        <IconTrailing data-icon="trailing" className={iconClassName} />
      ) : null}
    </AriaButton>
  )
}
