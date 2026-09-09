import { errorMessage } from '../errors'
import { useEffect, useRef, useState } from 'react'
import { useBlocker, useRouter } from '@tanstack/react-router'
import { Button } from './base/buttons/button'
import type { ReactNode, SelectHTMLAttributes } from 'react'

export const controlClass =
  'min-h-11 w-full rounded-lg bg-primary px-3.5 py-2.5 text-md text-primary shadow-xs ring-1 ring-primary ring-inset focus:ring-2 focus:ring-brand'

export function PageHeading({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string
  title: string
  description?: string
}) {
  return (
    <header className="mb-8 border-b border-secondary pb-6">
      <p className="text-sm font-semibold text-brand-secondary">{eyebrow}</p>
      <h1 className="mt-2 text-display-sm font-semibold text-primary">
        {title}
      </h1>
      {description && (
        <p className="mt-3 max-w-2xl text-lg text-tertiary">{description}</p>
      )}
    </header>
  )
}

export function ActionForm({
  children,
  action,
  label,
  success = 'Saved.',
  reset = false,
  guard = false,
  cancelHref,
}: {
  children: ReactNode
  action: (form: FormData) => Promise<unknown>
  label: string
  success?: string
  reset?: boolean
  guard?: boolean
  cancelHref?: string
}) {
  const router = useRouter()
  const [pending, setPending] = useState(false)
  const [dirty, setDirty] = useState(false)
  const [message, setMessage] = useState('')
  const [failed, setFailed] = useState(false)
  const feedback = useRef<HTMLParagraphElement>(null)
  const saved = useRef(false)
  const submitting = useRef(false)
  useEffect(() => {
    if (message) feedback.current?.focus()
  }, [message])
  useBlocker({
    enableBeforeUnload: guard && dirty,
    shouldBlockFn: () =>
      guard &&
      dirty &&
      !saved.current &&
      !window.confirm('Discard unsaved changes?'),
  })
  return (
    <form
      className="grid gap-5"
      onChange={() => {
        saved.current = false
        setDirty(true)
      }}
      onSubmit={async (event) => {
        event.preventDefault()
        if (submitting.current) return
        submitting.current = true
        const form = event.currentTarget
        setPending(true)
        setMessage('')
        setFailed(false)
        try {
          const destination = await action(new FormData(form))
          if (destination === false) return
          saved.current = true
          setDirty(false)
          setMessage(success)
          if (reset) form.reset()
          await router.invalidate()
          if (typeof destination === 'string')
            await router.navigate({ href: destination })
        } catch (error) {
          setFailed(true)
          setMessage(
            errorMessage(
              error,
              'Could not complete this action. Check the fields and availability, then retry.',
            ),
          )
        } finally {
          submitting.current = false
          setPending(false)
        }
      }}
    >
      <fieldset disabled={pending} className="grid min-w-0 gap-5">
        {children}
      </fieldset>
      <div
        className={
          guard
            ? 'sticky bottom-3 z-10 rounded-xl border border-secondary bg-primary p-4 shadow-xs'
            : ''
        }
      >
        {message && (
          <p
            ref={feedback}
            tabIndex={-1}
            role={failed ? 'alert' : 'status'}
            className={failed ? 'text-error-primary' : 'text-brand-secondary'}
          >
            {message}
          </p>
        )}
        <div className="flex flex-wrap items-center gap-3">
          <Button
            type="submit"
            isLoading={pending}
            isDisabled={pending}
            showTextWhileLoading
          >
            {label}
          </Button>
          {cancelHref && (
            <a className="admin-secondary-link" href={cancelHref}>
              Cancel
            </a>
          )}
          {guard && (
            <span className="text-sm text-tertiary">
              {pending
                ? 'Saving…'
                : dirty
                  ? 'Unsaved changes'
                  : 'Changes will be saved here.'}
            </span>
          )}
        </div>
      </div>
    </form>
  )
}

export function SelectField({
  label,
  name,
  children,
  ...props
}: {
  label: string
  name: string
  children: ReactNode
} & SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <label className="grid gap-1.5 text-sm font-medium text-secondary">
      {label}
      <select className={controlClass} name={name} required {...props}>
        {children}
      </select>
    </label>
  )
}

export function EmptyState({ children }: { children: ReactNode }) {
  return (
    <p className="rounded-xl border border-secondary bg-secondary p-8 text-tertiary">
      {children}
    </p>
  )
}
