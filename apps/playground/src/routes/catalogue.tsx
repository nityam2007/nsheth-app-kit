import { Link, Outlet, createFileRoute } from '@tanstack/react-router'

import { Container } from '@/components/container'

export const Route = createFileRoute('/catalogue')({
  head: () => ({
    meta: [
      { title: 'Catalogue | NSheth App Kit' },
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
    <div className="grid min-h-svh grid-rows-[auto_1fr_auto] bg-primary">
      <a
        className="fixed top-3 left-3 z-50 -translate-y-24 rounded-lg bg-brand-solid px-4 py-2.5 text-sm font-semibold text-white focus:translate-y-0 focus:outline-2 focus:outline-offset-2 focus:outline-brand"
        href="#catalogue-content"
      >
        Skip to content
      </a>
      <header className="border-b border-secondary">
        <Container className="flex min-h-18 items-center justify-between gap-6">
          <Link className="text-lg font-semibold text-primary" to="/">
            NSheth App Kit
          </Link>
          <nav
            className="flex items-center gap-5"
            aria-label="Catalogue navigation"
          >
            <Link
              className="text-sm font-semibold text-primary"
              to="/catalogue"
            >
              Catalogue
            </Link>
            <Link className="text-sm font-semibold text-tertiary" to="/blog">
              Notes
            </Link>
          </nav>
        </Container>
      </header>
      <main id="catalogue-content">
        <Outlet />
      </main>
      <footer className="border-t border-secondary py-8">
        <Container>
          <span className="text-sm text-tertiary">
            NSheth App Kit / Product catalogue
          </span>
        </Container>
      </footer>
    </div>
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
