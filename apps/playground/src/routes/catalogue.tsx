import { SiteShell } from '../components/site-shell'
import { appConfig } from '../app.config'
import { requireRouteModule } from '../module-route'
import { Link, Outlet, createFileRoute } from '@tanstack/react-router'

import { Container } from '@/components/container'

export const Route = createFileRoute('/catalogue')({
  beforeLoad: () => requireRouteModule('product'),
  head: () => ({
    meta: [
      { title: `Catalogue | ${appConfig.name}` },
      {
        name: 'description',
        content:
          'A focused product catalogue with request-for-quote enquiries.',
      },
    ],
  }),
  component: CatalogueLayout,
  notFoundComponent: CatalogueNotFound,
})

function CatalogueLayout() {
  return (
    <SiteShell>
      <Outlet />
    </SiteShell>
  )
}

function CatalogueNotFound() {
  return (
    <Container className="py-20 sm:py-28">
      <div className="max-w-2xl">
        <p className="text-sm font-semibold text-brand-secondary">404</p>
        <h1 className="mt-3 text-display-md font-semibold text-primary sm:text-display-lg">
          That product is not published.
        </h1>
        <p className="mt-4 text-lg text-tertiary">
          It may be a draft, or the address may be wrong.
        </p>
        <Link
          className="mt-6 inline-flex text-sm font-semibold text-brand-secondary hover:text-brand-secondary_hover"
          to="/catalogue"
        >
          Return to the catalogue
        </Link>
      </div>
    </Container>
  )
}
