import { Link, createFileRoute } from '@tanstack/react-router'
import { useDeferredValue, useState } from 'react'

import { Button } from '@/components/base/buttons/button'
import { Input } from '@/components/base/input/input'

import { getAdminProducts } from '../product.functions'

export const Route = createFileRoute('/admin/products/')({
  loader: () => getAdminProducts(),
  component: ProductsIndex,
})

function ProductsIndex() {
  const products = Route.useLoaderData()
  const [query, setQuery] = useState('')
  const [status, setStatus] = useState('ALL')
  const deferredQuery = useDeferredValue(query.trim().toLowerCase())
  const visibleProducts = products.filter(
    (product) =>
      (status === 'ALL' || product.status === status) &&
      (!deferredQuery ||
        product.name.toLowerCase().includes(deferredQuery) ||
        product.slug.includes(deferredQuery)),
  )
  const isFiltered = Boolean(query) || status !== 'ALL'

  return (
    <section aria-labelledby="products-title">
      <header className="flex flex-col gap-5 border-b border-secondary pb-6 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-semibold text-brand-secondary">
            Catalogue
          </p>
          <h1
            className="mt-2 text-display-sm font-semibold text-primary"
            id="products-title"
          >
            Products
          </h1>
          <p className="mt-2 text-md text-tertiary">
            Manage draft and published catalogue entries.
          </p>
        </div>
        <Link
          className="inline-flex min-h-10 items-center justify-center self-start rounded-lg bg-brand-solid px-3.5 py-2.5 text-sm font-semibold text-white shadow-xs-skeuomorphic hover:bg-brand-solid_hover sm:self-auto"
          to="/admin/products/new"
        >
          New product
        </Link>
      </header>

      <div className="mt-6 grid items-end gap-4 rounded-xl bg-primary p-4 shadow-xs ring-1 ring-secondary sm:grid-cols-[minmax(0,1fr)_12rem_auto]">
        <Input
          autoComplete="off"
          label="Search products"
          placeholder="Name or slug…"
          value={query}
          onChange={setQuery}
        />
        <label
          className="grid gap-1.5 text-sm font-medium text-secondary"
          htmlFor="product-filter-status"
        >
          Status
          <select
            className="min-h-11 rounded-lg bg-primary px-3.5 py-2.5 text-md text-primary shadow-xs ring-1 ring-primary ring-inset outline-hidden focus:ring-2 focus:ring-brand"
            id="product-filter-status"
            value={status}
            onChange={(event) => setStatus(event.currentTarget.value)}
          >
            <option value="ALL">All statuses</option>
            <option value="DRAFT">Draft</option>
            <option value="PUBLISHED">Published</option>
          </select>
        </label>
        <div className="flex min-h-11 items-center justify-between gap-3 sm:justify-end">
          <span className="text-sm text-tertiary" aria-live="polite">
            {visibleProducts.length} of {products.length}
          </span>
          {isFiltered ? (
            <Button
              color="tertiary"
              onPress={() => {
                setQuery('')
                setStatus('ALL')
              }}
            >
              Clear
            </Button>
          ) : null}
        </div>
      </div>

      <div
        className="mt-5 overflow-x-auto rounded-xl bg-primary shadow-xs ring-1 ring-secondary focus:outline-2 focus:outline-offset-2 focus:outline-brand"
        role="region"
        aria-label="Products"
        tabIndex={0}
      >
        <table className="w-full border-collapse text-left">
          <thead className="border-b border-secondary bg-secondary">
            <tr>
              <th
                className="px-4 py-3 text-xs font-semibold text-tertiary sm:px-6"
                scope="col"
              >
                Product
              </th>
              <th
                className="px-4 py-3 text-xs font-semibold text-tertiary"
                scope="col"
              >
                Status
              </th>
              <th
                className="hidden px-4 py-3 text-xs font-semibold text-tertiary md:table-cell"
                scope="col"
              >
                Published
              </th>
              <th
                className="hidden px-4 py-3 text-xs font-semibold text-tertiary lg:table-cell"
                scope="col"
              >
                Updated
              </th>
              <th
                className="px-4 py-3 text-right text-xs font-semibold text-tertiary sm:px-6"
                scope="col"
              >
                Action
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-secondary">
            {visibleProducts.length ? (
              visibleProducts.map((product) => (
                <tr className="hover:bg-primary_hover" key={product.id}>
                  <th
                    className="max-w-48 px-4 py-4 sm:max-w-none sm:px-6"
                    scope="row"
                  >
                    <Link
                      className="block truncate font-medium text-primary hover:text-brand-secondary"
                      to="/admin/products/$slug"
                      params={{ slug: product.slug }}
                    >
                      {product.name}
                    </Link>
                    <span className="mt-1 hidden truncate text-xs text-tertiary sm:block">
                      /catalogue/{product.slug}
                    </span>
                  </th>
                  <td className="px-4 py-4 text-sm text-tertiary">
                    <span
                      className={
                        product.status === 'PUBLISHED'
                          ? 'inline-flex rounded-full bg-success-primary px-2.5 py-0.5 text-xs font-medium text-success-primary'
                          : 'inline-flex rounded-full bg-secondary px-2.5 py-0.5 text-xs font-medium text-secondary'
                      }
                    >
                      {product.status === 'PUBLISHED' ? 'Published' : 'Draft'}
                    </span>
                  </td>
                  <td className="hidden px-4 py-4 text-sm text-tertiary md:table-cell">
                    {product.publishedAt ?? 'Not published'}
                  </td>
                  <td className="hidden px-4 py-4 text-sm text-tertiary lg:table-cell">
                    {product.updatedAt}
                  </td>
                  <td className="px-4 py-4 text-right sm:px-6">
                    <Link
                      className="inline-flex min-h-10 items-center text-sm font-semibold text-brand-secondary hover:text-brand-secondary_hover"
                      to="/admin/products/$slug/edit"
                      params={{ slug: product.slug }}
                    >
                      Edit
                    </Link>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  className="px-6 py-12 text-center text-sm text-tertiary"
                  colSpan={5}
                >
                  {products.length
                    ? 'No products match these filters.'
                    : 'No products yet. Create the first catalogue entry.'}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  )
}
