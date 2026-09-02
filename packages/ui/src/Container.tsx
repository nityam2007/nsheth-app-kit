import type { ComponentPropsWithoutRef } from 'react'

type ContainerProps = ComponentPropsWithoutRef<'div'> & {
  wide?: boolean
}

export function Container({
  className,
  wide = false,
  ...props
}: ContainerProps) {
  const classes = ['ns-container', wide && 'ns-container--wide', className]
    .filter(Boolean)
    .join(' ')

  return <div className={classes} {...props} />
}
