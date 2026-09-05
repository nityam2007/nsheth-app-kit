import { Link, Outlet } from '@tanstack/react-router'
import { Container } from './container'

export function PublicLayout() {
  return (
    <div className="flex min-h-svh flex-col bg-primary">
      <a href="#main-content" className="sr-only focus:not-sr-only focus:p-4">
        Skip to content
      </a>
      <header className="border-b border-secondary">
        <Container className="flex min-h-20 flex-wrap items-center justify-between gap-4 py-4">
          <Link to="/" className="text-lg font-semibold text-primary">
            NSheth App Kit
          </Link>
          <nav
            className="flex flex-wrap gap-x-5 gap-y-2 text-sm font-semibold text-secondary"
            aria-label="Site navigation"
          >
            <a className="inline-flex min-h-11 items-center" href="/stays">
              Stays
            </a>
            <a className="inline-flex min-h-11 items-center" href="/blog">
              Journal
            </a>
            <a className="inline-flex min-h-11 items-center" href="/catalogue">
              Catalogue
            </a>
            <a className="inline-flex min-h-11 items-center" href="/services">
              Services
            </a>
            <a className="inline-flex min-h-11 items-center" href="/admin">
              Admin
            </a>
          </nav>
        </Container>
      </header>
      <main id="main-content" className="flex-1">
        <Container className="py-12 sm:py-20">
          <Outlet />
        </Container>
      </main>
      <footer className="border-t border-secondary py-8">
        <Container className="flex flex-wrap justify-between gap-4 text-sm text-tertiary">
          <span>NSheth App Kit</span>
          <a href="/privacy">Privacy & contact</a>
        </Container>
      </footer>
    </div>
  )
}
