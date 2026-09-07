import { Link, useLocation } from '@tanstack/react-router'
import { appConfig, publicModules } from '../app.config'
import { Container } from './container'

export function SiteHeader() {
  const { pathname } = useLocation()
  return (
    <header className="border-b border-secondary bg-primary">
      <Container className="flex min-h-20 flex-wrap items-center justify-between gap-4 py-4">
        <Link
          to="/"
          className="inline-flex min-h-11 max-w-full items-center break-words text-lg font-semibold text-primary"
        >
          {appConfig.name}
        </Link>
        <nav
          aria-label="Site navigation"
          className="flex flex-wrap items-center gap-x-5 gap-y-1 text-sm font-semibold text-secondary"
        >
          {publicModules.map((m) => (
            <a
              key={m.id}
              href={m.href}
              aria-current={
                pathname === m.href || pathname.startsWith(m.href + '/')
                  ? 'page'
                  : undefined
              }
              className="inline-flex min-h-11 items-center outline-brand hover:text-brand-secondary focus-visible:outline-2 aria-[current=page]:text-brand-secondary"
            >
              {m.label}
            </a>
          ))}
          <Link to="/account" className="admin-secondary-link">
            Your account
          </Link>
        </nav>
      </Container>
    </header>
  )
}
