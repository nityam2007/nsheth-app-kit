import { useState } from 'react'
import type { ReactNode } from 'react'
import { Input } from '../base/input/input'
import { Button } from '../base/buttons/button'
import { controlClass } from '../workflow'

export function StatusBadge({ value }: { value: string }) {
  const positive = [
    'PUBLISHED',
    'CONFIRMED',
    'FULFILLED',
    'PAID',
    'ACTIVE',
    'VERIFIED',
    'RESOLVED',
  ].includes(value)
  const negative = ['CANCELLED', 'RETIRED', 'DISABLED', 'UNPAID'].includes(
    value,
  )
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset ${positive ? 'bg-brand-primary text-brand-secondary ring-brand' : negative ? 'bg-secondary text-error-primary ring-secondary' : 'bg-secondary text-secondary ring-secondary'}`}
    >
      <span className="size-1.5 rounded-full bg-current" aria-hidden="true" />
      {value.toLowerCase().replaceAll('_', ' ')}
    </span>
  )
}

export function WorkspaceHeading({
  eyebrow,
  title,
  description,
  action,
}: {
  eyebrow: string
  title: string
  description: string
  action?: ReactNode
}) {
  return (
    <header className="mb-8 flex flex-wrap items-end justify-between gap-5">
      <div className="min-w-0 max-w-2xl">
        <p className="mb-2 text-sm font-medium text-brand-secondary">
          {eyebrow}
        </p>
        <h1 className="text-display-sm font-semibold tracking-tight text-primary sm:text-display-md">
          {title}
        </h1>
        <p className="mt-3 text-md leading-7 text-tertiary">{description}</p>
      </div>
      {action}
    </header>
  )
}

export function SectionPanel({
  title,
  description,
  children,
  action,
}: {
  title: string
  description?: string
  children: ReactNode
  action?: ReactNode
}) {
  return (
    <section className="overflow-hidden rounded-xl border border-secondary bg-primary shadow-xs">
      <header className="flex flex-wrap items-center justify-between gap-4 border-b border-secondary px-5 py-5 sm:px-6">
        <div>
          <h2 className="text-lg font-semibold text-primary">{title}</h2>
          {description && (
            <p className="mt-1 text-sm text-tertiary">{description}</p>
          )}
        </div>
        {action}
      </header>
      <div className="p-5 sm:p-6">{children}</div>
    </section>
  )
}

export function MetricStrip({
  items,
}: {
  items: Array<{
    label: string
    value: string | number
    href?: string
    note?: string
  }>
}) {
  return (
    <dl
      className={`mb-8 grid gap-4 sm:grid-cols-2 ${items.length > 2 ? 'xl:grid-cols-4' : ''}`}
    >
      {items.map((item) => (
        <div
          key={item.label}
          className="rounded-xl border border-secondary bg-primary p-5 shadow-xs"
        >
          <dt className="text-sm font-medium text-tertiary">{item.label}</dt>
          <dd className="mt-3 text-display-sm font-semibold text-primary">
            {item.href ? (
              <a
                href={item.href}
                className="outline-brand hover:text-brand-secondary focus-visible:outline-2"
              >
                {item.value}
                <span className="sr-only"> · {item.label}</span>
              </a>
            ) : (
              item.value
            )}
            {item.note && (
              <p className="mt-2 text-xs text-tertiary">{item.note}</p>
            )}
          </dd>
        </div>
      ))}
    </dl>
  )
}

export type ObjectPreview = {
  id: string
  title: string
  subtitle: string
  status: string
  href: string
  image?: string | null
  meta?: Array<{ label: string; value: string }>
  initials?: string
  action?: { href: string; label: string }
}

export function ObjectCollection({
  title,
  eyebrow,
  description,
  objects,
  createHref,
  createLabel = 'Create new',
  empty = 'New records will appear here when they are created.',
  initialStatus = '',
  guidance,
}: {
  title: string
  eyebrow: string
  description: string
  objects: Array<ObjectPreview>
  createHref?: string
  createLabel?: string
  empty?: string
  initialStatus?: string
  guidance?: string
}) {
  const [search, setSearch] = useState(''),
    [status, setStatus] = useState(initialStatus),
    [view, setView] = useState<'list' | 'cards'>('list'),
    [page, setPage] = useState(0)
  const filtered = objects.filter(
    (item) =>
      (!status || item.status === status) &&
      `${item.id} ${item.title} ${item.subtitle} ${item.meta?.map((m) => m.value).join(' ')}`
        .toLowerCase()
        .includes(search.toLowerCase()),
  )
  const pageCount = Math.max(1, Math.ceil(filtered.length / 12)),
    currentPage = Math.min(page, pageCount - 1)
  const states = [
    ...new Set([
      ...objects.map((item) => item.status),
      ...(initialStatus ? [initialStatus] : []),
    ]),
  ]
  return (
    <section>
      <WorkspaceHeading
        eyebrow={eyebrow}
        title={title}
        description={description}
        action={
          createHref && (
            <a className="admin-primary-link" href={createHref}>
              + {createLabel}
            </a>
          )
        }
      />
      {guidance && (
        <p className="mb-6 border-l-2 border-brand pl-4 text-sm leading-6 text-secondary">
          {guidance}
        </p>
      )}
      <div className="mb-6 grid gap-4 rounded-xl border border-secondary bg-primary p-4 sm:grid-cols-[minmax(0,1fr)_12rem_auto]">
        <Input
          label={`Search ${title.toLowerCase()}`}
          placeholder="Search names, references or details…"
          value={search}
          onChange={(value) => {
            setSearch(value)
            setPage(0)
          }}
        />
        <label className="grid gap-1.5 text-sm font-medium text-secondary">
          Status
          <select
            className={controlClass}
            value={status}
            onChange={(event) => {
              setStatus(event.target.value)
              setPage(0)
            }}
          >
            <option value="">All statuses</option>
            {states.map((state) => (
              <option key={state} value={state}>
                {state.toLowerCase().replaceAll('_', ' ')}
              </option>
            ))}
          </select>
        </label>
        <p role="status" className="self-end py-3 text-sm text-tertiary">
          {filtered.length} of {objects.length} {title.toLowerCase()}
        </p>
      </div>
      {objects.length === 500 && (
        <p className="mb-5 text-sm text-tertiary">
          Showing the latest 500 records. Search and filters apply to this
          collection window; saved record links can open older records.
        </p>
      )}
      {objects.length > 0 && (
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm text-tertiary">
            Open a record to review its details and available actions.
          </p>
          <div className="flex gap-2" role="group" aria-label="Collection view">
            {(['list', 'cards'] as const).map((mode) => (
              <Button
                key={mode}
                color="secondary"
                aria-pressed={view === mode}
                onPress={() => setView(mode)}
              >
                {mode === 'list' ? 'List' : 'Cards'}
              </Button>
            ))}
          </div>
        </div>
      )}
      {filtered.length ? (
        <ul
          className={
            view === 'cards'
              ? 'grid gap-5 md:grid-cols-2 xl:grid-cols-3'
              : 'grid gap-3'
          }
        >
          {filtered
            .slice(currentPage * 12, (currentPage + 1) * 12)
            .map((item) => (
              <li
                key={item.id}
                className={`rounded-xl border border-secondary bg-primary shadow-xs ${view === 'list' ? 'grid items-center gap-4 p-5 xl:grid-cols-[minmax(0,1fr)_minmax(16rem,1fr)_auto]' : 'flex flex-col p-5'}`}
              >
                <div className="min-w-0">
                  <div className="mb-2">
                    <StatusBadge value={item.status} />
                  </div>
                  <h2 className="break-words text-lg font-semibold text-primary">
                    <a
                      className="outline-brand hover:text-brand-secondary focus-visible:outline-2"
                      href={item.href}
                    >
                      {item.title}
                    </a>
                  </h2>
                  <p className="mt-1 line-clamp-2 break-words text-sm leading-6 text-tertiary">
                    {item.subtitle}
                  </p>
                  {view === 'cards' && item.image && (
                    <img
                      src={item.image}
                      alt=""
                      loading="lazy"
                      referrerPolicy="no-referrer"
                      className="mt-4 aspect-[16/7] w-full rounded-lg object-cover"
                    />
                  )}
                </div>
                {item.meta && (
                  <dl
                    className={`grid grid-cols-2 gap-3 ${view === 'cards' ? 'my-5 border-t border-secondary pt-4' : ''}`}
                  >
                    {item.meta.map((meta) => (
                      <div key={meta.label}>
                        <dt className="text-xs text-tertiary">{meta.label}</dt>
                        <dd className="mt-1 break-words text-sm font-medium text-secondary">
                          {meta.value}
                        </dd>
                      </div>
                    ))}
                  </dl>
                )}
                <div className="mt-auto flex flex-wrap gap-2 xl:justify-end">
                  <a
                    className="admin-secondary-link"
                    href={item.href}
                    aria-label={`Open ${item.title}`}
                  >
                    Open details <span aria-hidden="true">→</span>
                  </a>
                  {item.action && (
                    <a
                      className="admin-secondary-link"
                      href={item.action.href}
                      aria-label={`${item.action.label}: ${item.title}`}
                    >
                      {item.action.label}
                    </a>
                  )}
                </div>
              </li>
            ))}
        </ul>
      ) : (
        <div className="rounded-xl border border-dashed border-secondary bg-primary px-6 py-16 text-center">
          <h2 className="text-lg font-semibold text-primary">
            {objects.length
              ? 'No matching results'
              : `No ${title.toLowerCase()} yet`}
          </h2>
          <p className="mx-auto mt-3 max-w-md text-tertiary">
            {objects.length ? 'Try another search or status.' : empty}
          </p>
          {(search || status) && (
            <div className="mt-5">
              <Button
                color="secondary"
                onPress={() => {
                  setSearch('')
                  setStatus('')
                }}
              >
                Clear filters
              </Button>
            </div>
          )}
        </div>
      )}
      {pageCount > 1 && (
        <nav
          aria-label="Collection pages"
          className="mt-6 flex items-center justify-between gap-4"
        >
          <Button
            color="secondary"
            isDisabled={currentPage === 0}
            onPress={() => setPage(currentPage - 1)}
          >
            Previous
          </Button>
          <span className="text-sm text-tertiary">
            Page {currentPage + 1} of {pageCount}
          </span>
          <Button
            color="secondary"
            isDisabled={currentPage + 1 >= pageCount}
            onPress={() => setPage(currentPage + 1)}
          >
            Next
          </Button>
        </nav>
      )}
    </section>
  )
}

export function RecordTrail({
  href,
  label,
  current,
}: {
  href: string
  label: string
  current?: string
}) {
  return (
    <nav aria-label="Breadcrumb" className="mb-6 text-sm">
      <a
        href={href}
        className="inline-flex min-h-11 items-center gap-2 font-medium text-brand-secondary"
      >
        ← {label}
      </a>
      {current && (
        <>
          <span className="mx-3 text-quaternary">/</span>
          <span aria-current="page" className="text-tertiary">
            {current}
          </span>
        </>
      )}
    </nav>
  )
}

export function FormSection({
  title,
  description,
  children,
}: {
  title: string
  description: string
  children: ReactNode
}) {
  return (
    <fieldset className="grid min-w-0 gap-5 rounded-xl border border-secondary bg-primary p-5 sm:p-6">
      <legend className="px-2 text-lg font-semibold text-primary">
        {title}
      </legend>
      <p className="text-sm leading-6 text-tertiary">{description}</p>
      {children}
    </fieldset>
  )
}

export function NextStep({
  title,
  description,
  href,
  label,
}: {
  title: string
  description: string
  href: string
  label: string
}) {
  return (
    <section
      aria-label="Next step"
      className="mb-8 flex flex-wrap items-center justify-between gap-5 rounded-xl border border-brand bg-brand-primary p-5 sm:p-6"
    >
      <div className="max-w-2xl">
        <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-brand-secondary">
          Next step
        </p>
        <h2 className="text-lg font-semibold text-primary">{title}</h2>
        <p className="mt-2 text-sm leading-6 text-secondary">{description}</p>
      </div>
      <a className="admin-primary-link" href={href}>
        {label} →
      </a>
    </section>
  )
}
