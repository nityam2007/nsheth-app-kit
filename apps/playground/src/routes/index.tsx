import { SiteShell } from '../components/site-shell'
import { createFileRoute, Link } from '@tanstack/react-router'
import { Container } from '../components/container'
import { appConfig, publicModules } from '../app.config'

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
    <SiteShell>
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
              <Link
                to={module.href}
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
              </Link>
            </li>
          ))}
        </ul>
        {!publicModules.length && (
          <p className="py-8 text-tertiary">
            Sign in to access your workspace.
          </p>
        )}
      </Container>
    </SiteShell>
  )
}
