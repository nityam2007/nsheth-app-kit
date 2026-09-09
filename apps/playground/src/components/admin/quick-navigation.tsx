import { useRef, useState } from 'react'
import { useHotkey } from '@tanstack/react-hotkeys'
import { hasPermission } from '@nsheth/identity'
import type { Principal } from '@nsheth/identity'
import type { AdminModule } from '@nsheth/admin'
import { adminWorkflows } from '../../admin-workflows'
import { controlClass } from '../workflow'

export function QuickNavigation({
  modules,
  principal,
}: {
  modules: ReadonlyArray<AdminModule>
  principal: Principal
}) {
  const dialog = useRef<HTMLDialogElement>(null)
  const input = useRef<HTMLInputElement>(null)
  const [query, setQuery] = useState('')
  function open() {
    setQuery('')
    if (!dialog.current?.open) dialog.current?.showModal()
    input.current?.focus()
  }
  useHotkey('Mod+K', open)
  const pages = [
    {
      href: '/admin',
      label: 'Workspace overview',
      description: 'Start a task and review incoming work',
    },
    ...modules.flatMap((module) => {
      const help = adminWorkflows[module.href]
      const items = [
        {
          href: module.href,
          label: module.label,
          description: help?.description ?? module.group,
        },
      ]
      if (
        help?.createLabel &&
        hasPermission(principal, module.permission.replace('.read', '.write'))
      )
        items.push({
          href: module.href + '/new',
          label: help.createLabel,
          description: module.group,
        })
      return items
    }),
    {
      href: '/account',
      label: 'Account & security',
      description: 'Profile, password and sessions',
    },
  ].filter((page) =>
    `${page.label} ${page.description}`
      .toLowerCase()
      .includes(query.trim().toLowerCase()),
  )
  return (
    <>
      <button
        type="button"
        className="admin-secondary-link"
        onClick={open}
        aria-haspopup="dialog"
      >
        Find a page{' '}
        <kbd className="hidden text-xs text-tertiary sm:inline">Ctrl / ⌘ K</kbd>
      </button>
      <dialog
        ref={dialog}
        aria-labelledby="quick-navigation-title"
        className="m-auto max-h-[80dvh] w-[min(38rem,calc(100%-2rem))] overflow-y-auto rounded-xl border border-secondary bg-primary p-5 text-primary shadow-xl backdrop:bg-overlay"
        onClick={(event) => {
          if (event.target === event.currentTarget) event.currentTarget.close()
        }}
      >
        <div className="mb-4 flex items-center justify-between gap-3">
          <h2 id="quick-navigation-title" className="text-xl font-semibold">
            Where do you want to go?
          </h2>
          <button
            className="admin-secondary-link"
            type="button"
            onClick={() => dialog.current?.close()}
          >
            Close
          </button>
        </div>
        <label className="grid gap-2 text-sm font-medium">
          Find a page or task
          <input
            ref={input}
            type="search"
            className={controlClass}
            placeholder="Try rooms, orders, write a post…"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
        </label>
        <p className="mt-3 text-xs text-tertiary">
          Use Tab to choose a result, Enter to open it, or Escape to close.
        </p>
        <nav aria-label="Page search results" className="mt-4">
          <ul className="divide-y divide-secondary">
            {pages.map((page) => (
              <li key={page.href}>
                <a
                  className="block min-h-11 rounded-lg px-3 py-3 hover:bg-secondary"
                  href={page.href}
                  onClick={() => dialog.current?.close()}
                >
                  <span className="font-semibold text-primary">
                    {page.label}
                  </span>
                  <span className="mt-1 block text-sm text-tertiary">
                    {page.description}
                  </span>
                </a>
              </li>
            ))}
          </ul>
          {!pages.length && (
            <p role="status" className="py-8 text-sm text-tertiary">
              No pages match “{query}”. Try a task such as products or
              appointments.
            </p>
          )}
        </nav>
      </dialog>
    </>
  )
}
