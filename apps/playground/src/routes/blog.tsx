import { Link, Outlet, createFileRoute } from '@tanstack/react-router'

import { Container } from '@/components/container'

export const Route = createFileRoute('/blog')({
  head: () => ({
    meta: [
      { title: 'Notes | NSheth App Kit' },
      {
        name: 'description',
        content: 'Practical notes on building clear, useful digital products.',
      },
    ],
  }),
  component: BlogLayout,
  notFoundComponent: BlogNotFound,
})

function BlogLayout() {
  return (
    <div className="grid min-h-svh grid-rows-[auto_1fr_auto] bg-primary">
      <a
        className="fixed top-3 left-3 z-50 -translate-y-24 rounded-lg bg-brand-solid px-4 py-2.5 text-sm font-semibold text-white focus:translate-y-0 focus:outline-2 focus:outline-offset-2 focus:outline-brand"
        href="#blog-content"
      >
        Skip to content
      </a>
      <header className="border-b border-secondary">
        <Container className="flex min-h-18 items-center justify-between gap-6">
          <Link className="text-lg font-semibold text-primary" to="/">
            NSheth App Kit
          </Link>
          <nav className="flex items-center gap-5" aria-label="Blog navigation">
            <Link className="text-sm font-semibold text-primary" to="/blog">
              Notes
            </Link>
            <Link className="text-sm font-semibold text-tertiary" to="/">
              Foundation
            </Link>
          </nav>
        </Container>
      </header>
      <main id="blog-content">
        <Outlet />
      </main>
      <footer className="border-t border-secondary py-8">
        <Container>
          <span className="text-sm text-tertiary">
            NSheth App Kit / Implementation notes
          </span>
        </Container>
      </footer>
    </div>
  )
}

function BlogNotFound() {
  return (
    <Container className="py-20 sm:py-28">
      <div className="max-w-2xl">
        <p className="text-sm font-semibold text-brand-secondary">404</p>
        <h1 className="mt-3 text-display-md font-semibold text-primary sm:text-display-lg">
          That note is not published.
        </h1>
        <p className="mt-4 text-lg text-tertiary">
          It may be a draft, or the address may be wrong.
        </p>
        <Link
          className="mt-6 inline-flex text-sm font-semibold text-brand-secondary hover:text-brand-secondary_hover"
          to="/blog"
        >
          Return to notes
        </Link>
      </div>
    </Container>
  )
}
