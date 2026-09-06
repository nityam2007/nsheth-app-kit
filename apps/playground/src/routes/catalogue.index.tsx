import { useState } from 'react'
import { Input } from '../components/base/input/input'
import { SelectField } from '../components/workflow'
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
  const [search, setSearch] = useState(''),
    [category, setCategory] = useState('')
  const rows = products.filter(
    (product) =>
      (!category || product.category === category) &&
      `${product.name} ${product.brand} ${product.tags.join(' ')}`
        .toLowerCase()
        .includes(search.toLowerCase()),
  )
  const categories = [
    ...new Set(products.map((product) => product.category).filter(Boolean)),
  ].sort()

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
              Explore the catalogue.
            </h1>
            <p className="mt-6 max-w-2xl text-lg text-tertiary sm:text-xl">
              Explore the current range, then request a quote for the quantity
              and context you need.
            </p>
          </div>
        </Container>
      </section>

      <Container className="py-12 sm:py-16">
        <div className="mb-8 grid gap-4 sm:grid-cols-2">
          <Input
            label="Search products, brands or tags"
            value={search}
            onChange={setSearch}
          />
          <SelectField
            label="Collection"
            name="category"
            value={category}
            onChange={(e) => setCategory(e.currentTarget.value)}
          >
            <option value="">All collections</option>
            {categories.map((value) => (
              <option key={value} value={value}>
                {value}
              </option>
            ))}
          </SelectField>
        </div>
        <p className="mb-5 text-sm text-tertiary" aria-live="polite">
          {rows.length} matching products
        </p>
        {rows.length ? (
          <ol className="grid border-t border-secondary lg:grid-cols-2">
            {rows.map((product, index) => (
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
                    {product.imageUrl && (
                      <img
                        src={product.imageUrl}
                        alt={product.name}
                        loading="lazy"
                        referrerPolicy="no-referrer"
                        className="mb-5 aspect-[4/3] w-full rounded-lg object-cover"
                      />
                    )}
                    <span className="mb-2 block text-sm text-tertiary">
                      {[product.brand, product.category]
                        .filter(Boolean)
                        .join(' · ')}
                    </span>
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
              No matching products.
            </h2>
            <p className="mt-2 text-md text-tertiary">
              Try another search or collection.
            </p>
          </div>
        )}
      </Container>
    </>
  )
}
