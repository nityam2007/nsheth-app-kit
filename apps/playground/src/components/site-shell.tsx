import type { ReactNode } from 'react'
import { Link } from '@tanstack/react-router'
import { appConfig, moduleEnabled } from '../app.config'
import { Container } from './container'
import { SiteHeader } from './site-header'

export function SiteShell({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-svh flex-col bg-primary">
      <a href="#main-content" className="sr-only focus:not-sr-only focus:p-4">
        Skip to content
      </a>
      <SiteHeader />
      <main id="main-content" className="min-w-0 flex-1">
        {children}
      </main>
      <footer className="border-t border-secondary">
        <Container className="flex flex-wrap items-center justify-between gap-x-6 gap-y-2 py-5 text-sm text-tertiary">
          <span>{appConfig.name}</span>
          <nav aria-label="Footer" className="flex flex-wrap gap-x-6">
            {moduleEnabled('operations') && (
              <Link to="/privacy" className="inline-flex min-h-11 items-center">
                Privacy & contact
              </Link>
            )}
            <Link to="/admin" className="inline-flex min-h-11 items-center">
              Admin workspace
            </Link>
          </nav>
        </Container>
      </footer>
    </div>
  )
}
