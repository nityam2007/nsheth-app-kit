import { Link, createFileRoute } from '@tanstack/react-router'

import { getAdminProducts } from '../product.functions'

export const Route = createFileRoute('/admin/products/')({
  loader: () => getAdminProducts(),
  component: ProductsIndex,
})

function ProductsIndex() {
  const products = Route.useLoaderData()

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

      <div
        className="mt-8 overflow-x-auto rounded-xl bg-primary shadow-xs ring-1 ring-secondary focus:outline-2 focus:outline-offset-2 focus:outline-brand"
        role="region"
        aria-label="Products"
        tabIndex={0}
      >
        <table className="w-full min-w-176 border-collapse text-left">
          <thead className="border-b border-secondary bg-secondary">
            <tr>
              {['Product', 'Status', 'Published', 'Updated'].map((heading) => (
                <th
                  className="px-6 py-3 text-xs font-semibold text-tertiary"
                  key={heading}
                  scope="col"
                >
                  {heading}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-secondary">
            {products.length ? (
              products.map((product) => (
                <tr className="hover:bg-primary_hover" key={product.id}>
                  <th className="px-6 py-4" scope="row">
                    <Link
                      className="font-medium text-primary hover:text-brand-secondary"
                      to="/admin/products/$slug"
                      params={{ slug: product.slug }}
                    >
                      {product.name}
                    </Link>
                    <span className="mt-1 block text-xs text-tertiary">
                      /catalogue/{product.slug}
                    </span>
                  </th>
                  <td className="px-6 py-4 text-sm text-tertiary">
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
                  <td className="px-6 py-4 text-sm text-tertiary">
                    {product.publishedAt ?? 'Not published'}
                  </td>
                  <td className="px-6 py-4 text-sm text-tertiary">
                    {product.updatedAt}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  className="px-6 py-12 text-center text-sm text-tertiary"
                  colSpan={4}
                >
                  No products yet. Create the first catalogue entry.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  )
}
