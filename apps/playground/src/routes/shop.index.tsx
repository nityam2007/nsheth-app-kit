import { createFileRoute, Link } from '@tanstack/react-router'
import { useState } from 'react'
import { useDebouncedValue } from '@tanstack/react-pacer'
import { getStoreProducts } from '../commerce.functions'
import { EmptyState, PageHeading, controlClass } from '../components/workflow'
import { Input } from '../components/base/input/input'
import { money } from '../money'

export const Route = createFileRoute('/shop/')({
  loader: () => getStoreProducts(),
  component: Shop,
})
function Shop() {
  const products = Route.useLoaderData()
  const [search, setSearch] = useState(''),
    [category, setCategory] = useState(''),
    [sort, setSort] = useState('name')
  const [query] = useDebouncedValue(search, { wait: 150 })
  const rows = products
    .filter(
      (p) =>
        (!category || p.category === category) &&
        `${p.name} ${p.summary}`.toLowerCase().includes(query.toLowerCase()),
    )
    .sort((a, b) =>
      sort === 'low'
        ? a.price - b.price
        : sort === 'high'
          ? b.price - a.price
          : a.name.localeCompare(b.name),
    )
  return (
    <section>
      <PageHeading
        eyebrow="Considered essentials"
        title="Made for everyday living"
        description="Explore the collection. Find something to make your day a little better."
      />
      <div className="mb-8 flex flex-wrap items-end gap-4">
        <div className="min-w-48 flex-1">
          <Input
            label="Search the collection"
            value={search}
            onChange={setSearch}
          />
        </div>
        <label className="grid gap-2 text-sm text-secondary">
          Collection
          <select
            className={controlClass}
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            <option value="">All collections</option>
            {[...new Set(products.map((p) => p.category))]
              .filter(Boolean)
              .map((c) => (
                <option key={c}>{c}</option>
              ))}
          </select>
        </label>
        <label className="grid gap-2 text-sm text-secondary">
          Sort
          <select
            className={controlClass}
            value={sort}
            onChange={(e) => setSort(e.target.value)}
          >
            <option value="name">Name</option>
            <option value="low">Price: low to high</option>
            <option value="high">Price: high to low</option>
          </select>
        </label>
        <Link
          className="inline-flex min-h-11 items-center font-semibold text-brand-secondary"
          to="/shop/cart"
        >
          View cart →
        </Link>
      </div>
      <p role="status" className="mb-5 text-sm text-tertiary">
        {rows.length} products
      </p>
      {!rows.length && (
        <EmptyState>
          No products match your search. Try another collection.
        </EmptyState>
      )}
      <div className="grid gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
        {rows.map((p) => (
          <article key={p.id}>
            {p.imageUrl ? (
              <img
                src={p.imageUrl}
                alt={p.name}
                className="mb-5 aspect-square w-full rounded-xl bg-secondary object-cover"
                loading="lazy"
                referrerPolicy="no-referrer"
              />
            ) : (
              <div
                className="mb-5 flex aspect-[4/3] items-center justify-center rounded-xl bg-secondary text-display-lg font-semibold text-quaternary"
                aria-hidden="true"
              >
                {p.name.slice(0, 1)}
              </div>
            )}
            <p className="text-xs font-semibold uppercase tracking-wider text-tertiary">
              {p.category || 'Collection'}
            </p>
            <h2 className="mt-2 text-xl font-semibold text-primary">
              <Link to="/shop/$slug" params={{ slug: p.slug }}>
                {p.name}
              </Link>
            </h2>
            <p className="my-2 text-tertiary">{p.summary}</p>
            <p className="font-semibold text-brand-secondary">
              {money(p.price)}{' '}
              <span className="ml-2 text-sm font-normal text-tertiary">
                {p.stock ? '' : 'Sold out'}
              </span>
            </p>
          </article>
        ))}
      </div>
    </section>
  )
}
