import { SiteHeader } from './site-header'
import { appConfig, moduleEnabled } from '../app.config'
import { Outlet } from '@tanstack/react-router'
import { Container } from './container'

export function PublicLayout() {
  return (
    <div className="flex min-h-svh flex-col bg-primary">
      <a href="#main-content" className="sr-only focus:not-sr-only focus:p-4">
        Skip to content
      </a>
      <SiteHeader />
      <main id="main-content" className="flex-1">
        <Container className="py-12 sm:py-20">
          <Outlet />
        </Container>
      </main>
      <footer className="border-t border-secondary py-8">
        <Container className="flex flex-wrap justify-between gap-4 text-sm text-tertiary">
          <span>{appConfig.name}</span>
          {moduleEnabled('operations') && (
            <a href="/privacy">Privacy & contact</a>
          )}
        </Container>
      </footer>
    </div>
  )
}
