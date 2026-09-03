import { Container } from '@nsheth/ui'
import { Link, Outlet, createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/blog')({
  head: () => ({
    meta: [
      { title: 'Notes | NSheth' },
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
    <div className="blog-shell">
      <a className="skip-link" href="#blog-content">
        Skip to content
      </a>
      <header className="blog-header">
        <Container className="blog-header__inner" wide>
          <Link className="wordmark" to="/">
            NSheth
          </Link>
          <nav aria-label="Blog navigation">
            <Link to="/blog">Notes</Link>
            <Link to="/">Foundation</Link>
          </nav>
        </Container>
      </header>
      <main id="blog-content">
        <Outlet />
      </main>
      <footer className="blog-footer">
        <Container wide>
          <span>NSheth / Useful digital work</span>
        </Container>
      </footer>
    </div>
  )
}

function BlogNotFound() {
  return (
    <Container className="blog-not-found">
      <h1>That note is not published.</h1>
      <p>It may be a draft, or the address may be wrong.</p>
      <Link className="text-link" to="/blog">
        Return to notes
      </Link>
    </Container>
  )
}
