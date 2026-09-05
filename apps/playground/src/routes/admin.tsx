import {
  File06,
  Home01,
  LayersThree01,
  Menu01,
  Package,
  Users01,
  XClose,
} from '@untitledui/icons'
import {
  Link,
  Outlet,
  createFileRoute,
  redirect,
  useLocation,
} from '@tanstack/react-router'
import { useEffect, useRef } from 'react'
import { useHotkey } from '@tanstack/react-hotkeys'

import { getAdminContext } from '../admin.functions'

import type { AdminModule } from '@nsheth/admin'
import type { Principal } from '@nsheth/identity'

export const Route = createFileRoute('/admin')({
  beforeLoad: async () => {
    try {
      return await getAdminContext()
    } catch {
      throw redirect({ to: '/login' })
    }
  },
  component: AdminLayout,
})

function AdminLayout() {
  useHotkey('Mod+Shift+H', () => {
    window.location.assign('/admin')
  })
  const { modules, principal } = Route.useRouteContext()
  const pathname = useLocation({ select: (location) => location.pathname })
  const mobileNavigation = useRef<HTMLDialogElement>(null)
  const activeModule = modules.find(
    (module) =>
      pathname === module.href || pathname.startsWith(`${module.href}/`),
  )

  useEffect(() => {
    if (mobileNavigation.current?.open) mobileNavigation.current.close()
  }, [pathname])

  return (
    <div className="min-h-svh bg-secondary lg:grid lg:grid-cols-[17.5rem_minmax(0,1fr)]">
      <a
        className="fixed top-3 left-3 z-50 -translate-y-24 rounded-lg bg-brand-solid px-4 py-2.5 text-sm font-semibold text-white focus:translate-y-0 focus:outline-2 focus:outline-offset-2 focus:outline-brand"
        href="#admin-content"
      >
        Skip to content
      </a>

      <aside className="sticky top-0 hidden h-svh flex-col border-r border-secondary bg-primary lg:flex">
        <div className="flex min-h-18 items-center justify-between gap-4 border-b border-secondary px-4 lg:px-5">
          <Link className="text-md font-semibold text-primary" to="/admin">
            NSheth App Kit
          </Link>
          <span className="rounded-md bg-brand-primary px-2 py-1 text-xs font-medium text-brand-secondary">
            Admin
          </span>
        </div>
        <AdminNavigation
          modules={modules}
          pathname={pathname}
          principal={principal}
        />
      </aside>

      <div className="min-w-0">
        <header className="sticky top-0 z-20 flex min-h-16 items-center justify-between gap-3 border-b border-secondary bg-primary px-4 lg:hidden">
          <button
            className="flex size-11 items-center justify-center rounded-lg text-secondary outline-brand hover:bg-primary_hover focus-visible:outline-2 focus-visible:outline-offset-2"
            type="button"
            aria-label="Open admin navigation"
            onClick={() => mobileNavigation.current?.showModal()}
          >
            <Menu01 aria-hidden="true" className="size-6" />
          </button>
          <strong className="min-w-0 truncate text-sm font-semibold text-primary">
            {activeModule?.label ?? 'Admin workspace'}
          </strong>
          <Link
            className="flex size-11 items-center justify-center rounded-lg text-secondary outline-brand hover:bg-primary_hover focus-visible:outline-2 focus-visible:outline-offset-2"
            to="/"
            aria-label="View site"
          >
            <Home01 aria-hidden="true" className="size-5" />
          </Link>
        </header>

        <dialog
          className="fixed inset-y-0 left-0 m-0 h-dvh w-[min(20rem,calc(100%-3rem))] max-h-none max-w-none overscroll-contain bg-primary p-0 text-primary shadow-xl backdrop:bg-overlay"
          ref={mobileNavigation}
          aria-labelledby="mobile-navigation-title"
          onClick={(event) => {
            if (event.target === event.currentTarget)
              event.currentTarget.close()
          }}
        >
          <div className="flex h-full flex-col">
            <div className="flex min-h-16 items-center justify-between gap-4 border-b border-secondary px-4">
              <div className="min-w-0">
                <strong
                  className="block truncate text-sm font-semibold text-primary"
                  id="mobile-navigation-title"
                >
                  NSheth App Kit
                </strong>
                <span className="block text-xs text-tertiary">
                  Admin workspace
                </span>
              </div>
              <button
                className="flex size-11 items-center justify-center rounded-lg text-secondary outline-brand hover:bg-primary_hover focus-visible:outline-2 focus-visible:outline-offset-2"
                type="button"
                aria-label="Close admin navigation"
                onClick={() => mobileNavigation.current?.close()}
              >
                <XClose aria-hidden="true" className="size-5" />
              </button>
            </div>
            <AdminNavigation
              modules={modules}
              pathname={pathname}
              principal={principal}
              onNavigate={() => mobileNavigation.current?.close()}
            />
          </div>
        </dialog>

        <header className="hidden min-h-18 items-center justify-between gap-4 border-b border-secondary bg-primary px-8 lg:flex">
          <span className="text-sm font-semibold text-secondary">
            {activeModule?.label ?? 'Admin workspace'}
          </span>
          <Link
            className="text-sm font-semibold text-brand-secondary hover:text-brand-secondary_hover"
            to="/"
          >
            View site
          </Link>
        </header>
        <main
          className="mx-auto w-full max-w-container p-4 sm:p-6 lg:p-8"
          id="admin-content"
        >
          <Outlet />
        </main>
      </div>
    </div>
  )
}

function AdminNavigation({
  modules,
  onNavigate,
  pathname,
  principal,
}: {
  modules: ReadonlyArray<AdminModule>
  onNavigate?: () => void
  pathname: string
  principal: Principal
}) {
  const groups = new Map<string, Array<AdminModule>>()
  for (const module of modules) {
    const group = groups.get(module.group)
    if (group) group.push(module)
    else groups.set(module.group, [module])
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <nav
        className="min-h-0 flex-1 overflow-y-auto p-4"
        aria-label="Admin modules"
      >
        <div className="grid gap-6">
          {[...groups].map(([group, groupModules]) => (
            <section key={group}>
              <h2 className="mb-2 px-3 text-xs font-semibold text-quaternary">
                {group}
              </h2>
              <ul className="grid gap-1">
                {groupModules.map((module) => {
                  const active =
                    pathname === module.href ||
                    pathname.startsWith(`${module.href}/`)
                  return (
                    <li key={module.id}>
                      <a
                        className={
                          active
                            ? 'flex min-h-11 items-center gap-3 rounded-lg bg-secondary px-3 py-2 text-sm font-semibold text-primary'
                            : 'flex min-h-11 items-center gap-3 rounded-lg px-3 py-2 text-sm font-semibold text-tertiary hover:bg-primary_hover hover:text-tertiary_hover'
                        }
                        href={module.href}
                        aria-current={active ? 'page' : undefined}
                        onClick={onNavigate}
                      >
                        <span
                          className={
                            active
                              ? 'flex size-8 items-center justify-center rounded-md bg-brand-primary text-brand-secondary'
                              : 'flex size-8 items-center justify-center rounded-md text-quaternary'
                          }
                        >
                          <ModuleIcon id={module.id} />
                        </span>
                        {module.label}
                      </a>
                    </li>
                  )
                })}
              </ul>
            </section>
          ))}
        </div>
      </nav>

      <div className="border-t border-secondary p-4">
        <div className="flex min-w-0 items-center gap-3 rounded-lg px-2 py-2">
          <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-brand-primary text-sm font-semibold text-brand-secondary">
            {principal.email.charAt(0).toUpperCase()}
          </span>
          <span className="min-w-0">
            <strong
              className="block truncate text-sm font-semibold text-primary"
              translate="no"
            >
              {principal.email}
            </strong>
            <span className="mt-0.5 block truncate text-xs text-tertiary">
              {principal.roles.join(', ')}
            </span>
          </span>
        </div>
      </div>
    </div>
  )
}

function ModuleIcon({ id }: { id: string }) {
  const Icon =
    id === 'product-catalogue'
      ? Package
      : id === 'content-posts'
        ? File06
        : id === 'identity-users'
          ? Users01
          : LayersThree01

  return <Icon aria-hidden="true" className="size-5" />
}
