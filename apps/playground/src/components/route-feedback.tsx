import { useRouter } from '@tanstack/react-router'
import { errorMessage, errorStatus } from '../errors'
import { Button } from './base/buttons/button'

export function RouteError({ error }: { error: Error }) {
  const router = useRouter(),
    status = errorStatus(error)
  return (
    <section role="alert" className="mx-auto max-w-2xl px-6 py-16">
      <p className="text-sm font-semibold text-brand-secondary">
        {status === 503
          ? 'Temporarily unavailable'
          : 'Unable to load this page'}
      </p>
      <h1 className="mt-3 text-3xl font-semibold text-primary">
        {status === 403
          ? 'You do not have access'
          : status === 503
            ? 'We could not reach the data service'
            : 'Something needs attention'}
      </h1>
      <p className="my-5 leading-7 text-tertiary">
        {errorMessage(
          error,
          'Please try again. If you just submitted a request, check for a reference before submitting it again.',
        )}
      </p>
      {import.meta.env.DEV && !status && (
        <details open className="mb-6 rounded-lg border border-secondary p-4">
          <summary className="font-semibold text-secondary">
            Development error details
          </summary>
          <pre className="mt-3 overflow-x-auto whitespace-pre-wrap break-words text-sm text-tertiary">
            {error instanceof Error
              ? `${error.name}: ${error.message}`
              : String(error)}
          </pre>
        </details>
      )}
      {import.meta.env.DEV && status === 503 && (
        <p className="mb-6 text-sm text-tertiary">
          Local setup: run npm run doctor, start PostgreSQL, and apply the
          migrations. See docs/LOCAL_DEVELOPMENT.md.
        </p>
      )}
      <div className="flex flex-wrap items-center gap-5">
        <Button onPress={() => void router.invalidate()}>Try again</Button>
        <a
          className="inline-flex min-h-11 items-center text-brand-secondary"
          href="/"
        >
          Return home
        </a>
      </div>
    </section>
  )
}
export function RouteNotFound() {
  return (
    <section className="mx-auto max-w-2xl px-6 py-16">
      <p className="text-sm text-tertiary">404</p>
      <h1 className="mt-3 text-3xl font-semibold text-primary">
        Page not found
      </h1>
      <p className="my-5 text-tertiary">
        This page may have moved, or the record is not published.
      </p>
      <a
        className="inline-flex min-h-11 items-center text-brand-secondary"
        href="/"
      >
        Return home
      </a>
    </section>
  )
}
export function RoutePending() {
  return (
    <div role="status" aria-live="polite" className="p-8 text-tertiary">
      Loading your workspace…
    </div>
  )
}
