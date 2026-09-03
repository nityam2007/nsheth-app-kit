import { ArrowUpRight } from '@untitledui/icons'
import { Link, createFileRoute } from '@tanstack/react-router'

import { Container } from '@/components/container'

import { getPublishedProducts } from '../product.functions'

export const Route = createFileRoute('/catalogue/')({
  loader: () => getPublishedProducts(),
  component: CatalogueIndex,
})

function CatalogueIndex() {
  const products = Route.useLoaderData()

  return (
    <>
      <section
        className="border-b border-secondary py-16 sm:py-24"
        aria-labelledby="catalogue-title"
      >
        <Container>
          <div className="max-w-3xl">
            <p className="text-sm font-semibold text-brand-secondary">
              Made for the work
            </p>
            <h1
              className="mt-3 text-display-lg font-semibold text-primary sm:text-display-xl"
              id="catalogue-title"
            >
              Products without the hard sell.
            </h1>
            <p className="mt-6 max-w-2xl text-lg text-tertiary sm:text-xl">
              Explore the current range, then request a quote for the quantity
              and context you need.
            </p>
          </div>
        </Container>
      </section>

      <Container className="py-12 sm:py-16">
        {products.length ? (
          <ol className="grid border-t border-secondary lg:grid-cols-2">
            {products.map((product, index) => (
              <li
                className="border-b border-secondary lg:odd:border-r lg:odd:pr-8 lg:even:pl-8"
                key={product.id}
              >
                <Link
                  className="group flex min-h-56 flex-col justify-between gap-8 py-8"
                  to="/catalogue/$slug"
                  params={{ slug: product.slug }}
                >
                  <span className="flex items-center justify-between gap-4">
                    <span className="text-sm font-medium text-quaternary">
                      {String(index + 1).padStart(2, '0')}
                    </span>
                    <ArrowUpRight
                      aria-hidden="true"
                      className="size-5 text-brand-secondary transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                    />
                  </span>
                  <span>
                    <strong className="block text-display-xs font-semibold text-primary group-hover:text-brand-secondary sm:text-display-sm">
                      {product.name}
                    </strong>
                    <span className="mt-3 block max-w-xl text-md text-tertiary">
                      {product.summary}
                    </span>
                  </span>
                </Link>
              </li>
            ))}
          </ol>
        ) : (
          <div className="rounded-xl bg-secondary px-6 py-16 text-center ring-1 ring-secondary">
            <h2 className="text-lg font-semibold text-primary">
              No published products yet.
            </h2>
            <p className="mt-2 text-md text-tertiary">
              Drafts stay private until they are ready.
            </p>
          </div>
        )}
      </Container>
    </>
  )
}
