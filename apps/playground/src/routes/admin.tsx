import {
  Link,
  Outlet,
  createFileRoute,
  redirect,
  useLocation,
} from '@tanstack/react-router'

import { getAdminContext } from '../admin.functions'

export const Route = createFileRoute('/admin')({
  beforeLoad: async () => {
    try {
      return await getAdminContext()
    } catch {
      throw redirect({ to: '/' })
    }
  },
  component: AdminLayout,
})

function AdminLayout() {
  const { modules, principal } = Route.useRouteContext()
  const pathname = useLocation({ select: (location) => location.pathname })

  return (
    <div className="min-h-svh bg-secondary lg:grid lg:grid-cols-[17.5rem_minmax(0,1fr)]">
      <a
        className="fixed top-3 left-3 z-50 -translate-y-24 rounded-lg bg-brand-solid px-4 py-2.5 text-sm font-semibold text-white focus:translate-y-0 focus:outline-2 focus:outline-offset-2 focus:outline-brand"
        href="#admin-content"
      >
        Skip to content
      </a>

      <aside className="z-20 border-b border-secondary bg-primary lg:sticky lg:top-0 lg:h-svh lg:border-r lg:border-b-0">
        <div className="flex min-h-18 items-center justify-between gap-4 border-b border-secondary px-4 lg:px-5">
          <Link className="text-md font-semibold text-primary" to="/">
            NSheth App Kit
          </Link>
          <span className="rounded-md bg-brand-primary px-2 py-1 text-xs font-medium text-brand-secondary">
            Admin
          </span>
        </div>

        <details
          className="group lg:flex lg:h-[calc(100svh-4.5rem)] lg:flex-col"
          open
        >
          <summary className="flex min-h-13 cursor-pointer items-center justify-between px-4 text-sm font-semibold text-secondary lg:hidden">
            <span>Menu</span>
            <span aria-hidden="true" className="group-open:rotate-45">
              +
            </span>
          </summary>
          <div className="hidden gap-6 border-t border-secondary p-4 group-open:grid lg:grid lg:min-h-0 lg:flex-1 lg:grid-rows-[1fr_auto] lg:border-0 lg:p-4">
            <nav aria-label="Admin modules">
              <ul className="grid gap-1">
                {modules.map((module) => {
                  const active = pathname === module.href
                  return (
                    <li key={module.id}>
                      <span className="mb-1 block px-3 pt-3 text-xs font-semibold text-quaternary">
                        {module.group}
                      </span>
                      <a
                        className={
                          active
                            ? 'flex min-h-11 items-center rounded-md bg-secondary px-3 py-2 text-sm font-semibold text-secondary'
                            : 'flex min-h-11 items-center rounded-md px-3 py-2 text-sm font-semibold text-tertiary hover:bg-primary_hover hover:text-tertiary_hover'
                        }
                        href={module.href}
                        aria-current={active ? 'page' : undefined}
                      >
                        {module.label}
                      </a>
                    </li>
                  )
                })}
              </ul>
            </nav>

            <div className="border-t border-secondary px-3 pt-4">
              <span className="block text-xs text-tertiary">Signed in as</span>
              <strong className="mt-1 block truncate text-sm font-semibold text-primary">
                {principal.email}
              </strong>
              <span className="mt-0.5 block text-xs text-tertiary">
                {principal.roles.join(', ')}
              </span>
            </div>
          </div>
        </details>
      </aside>

      <div className="min-w-0">
        <header className="flex min-h-18 items-center justify-between gap-4 border-b border-secondary bg-primary px-4 sm:px-6 lg:px-8">
          <span className="text-sm font-semibold text-secondary">
            Admin workspace
          </span>
          <Link
            className="text-sm font-semibold text-brand-secondary hover:text-brand-secondary_hover"
            to="/"
          >
            View foundation
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
