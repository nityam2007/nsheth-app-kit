import {
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
    <>
      <a className="skip-link" href="#admin-content">
        Skip to content
      </a>
      <div className="admin-shell">
        <aside className="admin-sidebar" aria-label="Admin navigation">
          <div className="admin-sidebar__brand">
            <a href="/" aria-label="NSheth home">
              NSheth
            </a>
            <span>Control</span>
          </div>

          <details className="admin-navigation">
            <summary>
              <span>Menu</span>
              <span aria-hidden="true">+</span>
            </summary>
            <div className="admin-navigation__body">
              <nav aria-label="Admin modules">
                <ul>
                  {modules.map((module) => (
                    <li key={module.id}>
                      <span>{module.group}</span>
                      <a
                        href={module.href}
                        aria-current={
                          pathname === module.href ? 'page' : undefined
                        }
                      >
                        {module.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </nav>

              <div className="admin-account">
                <span>Signed in</span>
                <strong>{principal.email}</strong>
                <small>{principal.roles.join(', ')}</small>
              </div>
            </div>
          </details>
        </aside>

        <div className="admin-workspace">
          <header className="admin-topbar">
            <span>Admin workspace</span>
            <a href="/">Foundation showcase</a>
          </header>
          <main id="admin-content" className="admin-content">
            <Outlet />
          </main>
        </div>
      </div>
    </>
  )
}
