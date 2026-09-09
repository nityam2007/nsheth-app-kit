import { Outlet } from '@tanstack/react-router'
import { Container } from './container'
import { SiteShell } from './site-shell'

export function PublicLayout() {
  return (
    <SiteShell>
      <Container className="py-10 sm:py-12">
        <Outlet />
      </Container>
    </SiteShell>
  )
}
