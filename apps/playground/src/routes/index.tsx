import { SiteHeader } from '../components/site-header'
import { createFileRoute, Link } from '@tanstack/react-router'
import { Container } from '../components/container'
import { appConfig, publicModules, moduleEnabled } from '../app.config'

export const Route = createFileRoute('/')({
  component: Home,
  head: () => ({
    meta: [
      { title: appConfig.name },
      { name: 'description', content: appConfig.description },
    ],
  }),
})
function Home() {
  return (
    <div className="min-h-svh bg-primary">
      <a href="#main-content" className="sr-only focus:not-sr-only focus:p-4">
        Skip to content
      </a>
      <SiteHeader />
      <main id="main-content">
        <Container className="py-12 sm:py-16">
          <div className="mb-10 max-w-3xl">
            <p className="mb-3 text-sm font-semibold text-brand-secondary">
              Find what you need
            </p>
            <h1 className="text-display-md font-semibold text-primary sm:text-display-lg">
              {appConfig.name}
            </h1>
            <p className="mt-5 text-lg leading-8 text-tertiary">
              {appConfig.description}
            </p>
          </div>
          <ul className="grid gap-x-12 md:grid-cols-2">
            {publicModules.map((module) => (
              <li key={module.id} className="border-t border-secondary py-7">
                <a
                  href={module.href}
                  className="group block rounded-sm outline-brand focus-visible:outline-2 focus-visible:outline-offset-4"
                >
                  <div className="flex items-center justify-between gap-5">
                    <h2 className="text-2xl font-semibold text-primary group-hover:text-brand-secondary">
                      {
                        {
                          content: 'Read the journal',
                          product: 'Explore products & request a quote',
                          commerce: 'Shop products',
                          booking: 'Book an appointment',
                          hospitality: 'Find a place to stay',
                          operations: 'Contact the team',
                        }[module.id]
                      }
                    </h2>
                    <span
                      aria-hidden="true"
                      className="text-2xl text-brand-secondary"
                    >
                      ↗
                    </span>
                  </div>
                  <p className="mt-3 max-w-lg leading-7 text-tertiary">
                    {module.description}
                  </p>
                </a>
              </li>
            ))}
          </ul>
          {!publicModules.length && (
            <p className="py-8 text-tertiary">
              Sign in to access your workspace.
            </p>
          )}
          <section
            className="mt-8 flex flex-wrap items-center justify-between gap-5 rounded-xl border border-secondary bg-secondary p-6"
            aria-labelledby="account-help-title"
          >
            <div>
              <h2
                id="account-help-title"
                className="text-lg font-semibold text-primary"
              >
                Already placed a request?
              </h2>
              <p className="mt-2 text-sm text-tertiary">
                Sign in to see your orders, appointments and reservations in
                your account.
              </p>
            </div>
            <Link to="/account" className="admin-secondary-link">
              Open your account →
            </Link>
          </section>
        </Container>
      </main>
      <footer className="border-t border-secondary">
        <Container className="flex flex-wrap justify-between gap-5 py-8 text-sm text-tertiary">
          <span>{appConfig.name}</span>
          <Link
            to="/admin"
            className="inline-flex min-h-11 items-center font-semibold text-brand-secondary"
          >
            Manage your business →
          </Link>
          {moduleEnabled('operations') && (
            <Link to="/privacy">Privacy & contact</Link>
          )}
        </Container>
      </footer>
    </div>
  )
}
