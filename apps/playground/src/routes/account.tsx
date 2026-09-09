import { SiteShell } from '../components/site-shell'
import {
  createFileRoute,
  Link,
  Outlet,
  redirect,
  useLocation,
} from '@tanstack/react-router'
import { useServerFn } from '@tanstack/react-start'
import { useQueryClient } from '@tanstack/react-query'
import { getAccount, signOut } from '../account.functions'
import { errorStatus } from '../errors'
import { Container } from '../components/container'
import { ActionForm } from '../components/workflow'

export const Route = createFileRoute('/account')({
  loader: async () => {
    try {
      return await getAccount()
    } catch (error) {
      if (errorStatus(error) === 401) throw redirect({ to: '/login' })
      throw error
    }
  },
  component: AccountShell,
})
function AccountShell() {
  const data = Route.useLoaderData(),
    logout = useServerFn(signOut),
    query = useQueryClient()
  const { pathname } = useLocation()
  return (
    <SiteShell>
      <Container className="py-8 sm:py-12">
        <header className="mb-8 flex flex-wrap items-center justify-between gap-4">
          {data.principal.permissions.length > 0 && (
            <Link to="/admin" className="admin-secondary-link">
              Open admin workspace →
            </Link>
          )}
        </header>
        <div className="grid items-start gap-8 lg:grid-cols-[15rem_minmax(0,1fr)]">
          <aside className="rounded-xl border border-secondary bg-primary p-5 lg:sticky lg:top-8">
            <div className="mb-6 border-b border-secondary pb-5">
              <span
                aria-hidden="true"
                className="mb-4 flex size-12 items-center justify-center rounded-full bg-brand-primary text-xl font-semibold text-brand-secondary"
              >
                {data.principal.email[0].toUpperCase()}
              </span>
              <p className="font-semibold text-primary">Your account</p>
              <p className="mt-1 break-all text-sm text-tertiary">
                {data.principal.email}
              </p>
            </div>
            <nav aria-label="Account">
              <ul className="grid gap-2">
                {[
                  ['/account', 'Activity'],
                  ['/account/profile', 'Profile'],
                  ['/account/security', 'Security & data'],
                ].map(([href, label]) => (
                  <li key={href}>
                    <a
                      href={href}
                      aria-current={pathname === href ? 'page' : undefined}
                      className={
                        'flex min-h-11 items-center rounded-lg px-3 text-sm font-semibold ' +
                        (pathname === href
                          ? 'bg-secondary text-primary'
                          : 'text-tertiary hover:bg-secondary')
                      }
                    >
                      {label}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
            <div className="mt-6 border-t border-secondary pt-5">
              <ActionForm
                label="Sign out"
                action={async () => {
                  await logout()
                  query.clear()
                  return '/login'
                }}
              >
                {null}
              </ActionForm>
            </div>
          </aside>
          <div className="min-w-0">
            <Outlet />
          </div>
        </div>
      </Container>
    </SiteShell>
  )
}
