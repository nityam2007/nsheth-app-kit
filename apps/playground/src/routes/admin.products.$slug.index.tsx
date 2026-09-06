import { ActionForm } from '../components/workflow'
import { Input } from '../components/base/input/input'
import {
  ProductGallery,
  ProductSpecifications,
} from '../components/product-information'
import {
  changeProductLifecycle,
  createProductOption,
  deleteAdminProduct,
  getAdminProduct,
} from '../product.functions'
import {
  Link,
  createFileRoute,
  notFound,
  useNavigate,
} from '@tanstack/react-router'
import { useServerFn } from '@tanstack/react-start'
import { useState } from 'react'

import { Button } from '@/components/base/buttons/button'

export const Route = createFileRoute('/admin/products/$slug/')({
  loader: async ({ params }) => {
    const product = await getAdminProduct({ data: { slug: params.slug } })
    if (!product) throw notFound()
    return product
  },
  component: ProductDetail,
})

function ProductDetail() {
  const product = Route.useLoaderData()
  const lifecycle = useServerFn(changeProductLifecycle),
    createOption = useServerFn(createProductOption)
  const removeProduct = useServerFn(deleteAdminProduct)
  const navigate = useNavigate()
  const [error, setError] = useState('')
  const [isDeleting, setIsDeleting] = useState(false)

  async function handleDelete() {
    if (!window.confirm(`Delete “${product.name}”? This cannot be undone.`)) {
      return
    }

    setError('')
    setIsDeleting(true)
    try {
      await removeProduct({ data: { slug: product.slug } })
      await navigate({ to: '/admin/products' })
    } catch {
      setError(
        product.enquiryCount
          ? 'Products with options, stock history, orders, or quote requests must be retired instead.'
          : 'Could not delete this product.',
      )
      setIsDeleting(false)
    }
  }

  return (
    <article aria-labelledby="product-title">
      <Link
        className="text-sm font-semibold text-brand-secondary"
        to="/admin/products"
      >
        Products
      </Link>
      <header className="mt-5 flex flex-col gap-6 border-b border-secondary pb-6 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0">
          <p className="text-sm font-semibold text-brand-secondary">
            Catalogue
          </p>
          <h1
            className="mt-2 text-display-sm font-semibold text-primary"
            id="product-title"
          >
            {product.name}
          </h1>
          <p className="mt-2 text-sm text-tertiary">
            /catalogue/{product.slug}
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          {product.status === 'PUBLISHED' ? (
            <Link
              className="inline-flex min-h-10 items-center justify-center rounded-lg bg-primary px-3.5 py-2.5 text-sm font-semibold text-secondary shadow-xs-skeuomorphic ring-1 ring-primary ring-inset hover:bg-primary_hover"
              to="/catalogue/$slug"
              params={{ slug: product.slug }}
            >
              View product
            </Link>
          ) : null}
          <Link
            className="inline-flex min-h-10 items-center justify-center rounded-lg bg-brand-solid px-3.5 py-2.5 text-sm font-semibold text-white shadow-xs-skeuomorphic hover:bg-brand-solid_hover"
            to="/admin/products/$slug/edit"
            params={{ slug: product.slug }}
          >
            Edit product
          </Link>
          <Link
            className="inline-flex min-h-11 items-center text-sm font-semibold text-brand-secondary"
            to="/admin/products/$slug/sale"
            params={{ slug: product.slug }}
          >
            Price & inventory
          </Link>
        </div>
      </header>

      <div className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,1fr)_18rem]">
        <div className="rounded-xl bg-primary p-5 shadow-xs ring-1 ring-secondary sm:p-8">
          {product.gallery.length > 0 && (
            <ProductGallery images={product.gallery} name={product.name} />
          )}
          <p className="mt-5 text-lg text-tertiary">{product.summary}</p>
          <ProductSpecifications {...product} />
          {product.parent && (
            <a
              href={`/admin/products/${product.parent.slug}`}
              className="my-5 inline-flex min-h-11 items-center text-brand-secondary"
            >
              Parent: {product.parent.name}
            </a>
          )}
          {!product.parentId && (
            <section className="mt-8 border-t border-secondary pt-6">
              <h2 className="mb-4 text-xl font-semibold text-primary">
                Product options
              </h2>
              <p className="mb-5 text-sm text-tertiary">
                Each option has its own SKU, price, stock and publication
                settings. New options start as drafts.
              </p>
              <ul className="mb-6 divide-y divide-secondary">
                {product.options.map((option) => (
                  <li key={option.id} className="py-3">
                    <a
                      className="font-semibold text-brand-secondary"
                      href={`/admin/products/${option.slug}`}
                    >
                      {option.optionLabel}
                    </a>
                    <p className="mt-1 text-sm text-tertiary">
                      {option.sku} · {option.status} · {option.stock} available
                      {option.archivedAt ? ' · Retired' : ''}
                    </p>
                  </li>
                ))}
              </ul>
              <ActionForm
                label="Create option"
                action={async (f) => {
                  const option = await createOption({
                    data: {
                      parentId: product.id,
                      label: String(f.get('label')),
                      sku: String(f.get('sku')),
                    },
                  })
                  return `/admin/products/${option.slug}`
                }}
              >
                <Input
                  name="label"
                  label="Option label"
                  hint="For example: Blue / Large"
                  isRequired
                  maxLength={80}
                />
                <Input
                  name="sku"
                  label="Option SKU"
                  isRequired
                  maxLength={80}
                />
              </ActionForm>
            </section>
          )}
          <section className="mt-8 border-t border-secondary pt-6">
            <h2 className="mb-4 text-xl font-semibold text-primary">
              Stock movements
            </h2>
            {product.movements.length ? (
              <ol className="divide-y divide-secondary">
                {product.movements.map((m) => (
                  <li key={m.id} className="py-3 text-sm text-tertiary">
                    {m.createdAt.toISOString().slice(0, 16).replace('T', ' ')} ·{' '}
                    {m.reason} · {m.delta > 0 ? '+' : ''}
                    {m.delta} → {m.balance} available
                  </li>
                ))}
              </ol>
            ) : (
              <p className="text-sm text-tertiary">
                No recorded movements. Existing stock is the opening balance.
              </p>
            )}
          </section>
          <div className="mt-8 whitespace-pre-wrap border-t border-secondary pt-8 text-md leading-8 text-secondary">
            {product.description}
          </div>
        </div>
        <aside className="space-y-6">
          <dl className="divide-y divide-secondary rounded-xl bg-primary px-5 shadow-xs ring-1 ring-secondary">
            {[
              [
                'Status',
                product.status === 'PUBLISHED' ? 'Published' : 'Draft',
              ],
              ['Quote requests', String(product.enquiryCount)],
              ['Published', product.publishedAt ?? 'Not published'],
              ['Created', product.createdAt],
              ['Updated', product.updatedAt],
            ].map(([term, value]) => (
              <div className="py-4" key={term}>
                <dt className="text-xs font-semibold text-tertiary">{term}</dt>
                <dd className="mt-1 text-sm font-medium text-primary">
                  {value}
                </dd>
              </div>
            ))}
          </dl>
          <div className="grid gap-6 rounded-xl bg-primary p-5 ring-1 ring-secondary">
            <ActionForm
              label="Copy to draft"
              action={async () => {
                const result = await lifecycle({
                  data: {
                    id: product.id,
                    expectedVersion: product.version,
                    action: 'copy',
                  },
                })
                return `/admin/products/${result.slug}`
              }}
            >
              <p className="text-sm text-tertiary">
                Copies details; starts with no SKU, stock or activity.
              </p>
            </ActionForm>
            <ActionForm
              label={product.archivedAt ? 'Restore draft' : 'Retire product'}
              action={async () => {
                if (
                  !window.confirm(
                    product.archivedAt
                      ? 'Restore as an unpublished draft?'
                      : 'Remove this product and its options from public view?',
                  )
                )
                  return false
                await lifecycle({
                  data: {
                    id: product.id,
                    expectedVersion: product.version,
                    action: product.archivedAt ? 'restore' : 'retire',
                  },
                })
              }}
            >
              <p className="text-sm text-tertiary">
                {product.archivedAt
                  ? 'Retired. Restore before publishing.'
                  : 'Retirement keeps stock and transaction history.'}
              </p>
            </ActionForm>
          </div>
          <div className="rounded-xl bg-primary p-5 shadow-xs ring-1 ring-secondary">
            <h2 className="text-sm font-semibold text-primary">Danger zone</h2>
            <p className="mt-2 text-sm text-tertiary">
              Products with options, stock history, orders, or quote requests
              must be retired instead.
            </p>
            <Button
              className="mt-4 text-error-primary"
              color="secondary"
              isDisabled={
                isDeleting ||
                product.historyCount > 0 ||
                product.options.length > 0
              }
              isLoading={isDeleting}
              showTextWhileLoading
              onPress={handleDelete}
            >
              Delete product
            </Button>
            {error ? (
              <p className="mt-3 text-sm text-error-primary" role="alert">
                {error}
              </p>
            ) : null}
          </div>
        </aside>
      </div>
    </article>
  )
}
