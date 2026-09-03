import {
  Link,
  createFileRoute,
  notFound,
  useNavigate,
} from '@tanstack/react-router'
import { useServerFn } from '@tanstack/react-start'
import { useState } from 'react'

import { Button } from '@/components/base/buttons/button'

import { deleteAdminProduct, getAdminProduct } from '../product.functions'

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
          ? 'Products with quote requests cannot be deleted.'
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
        </div>
      </header>

      <div className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,1fr)_18rem]">
        <div className="rounded-xl bg-primary p-5 shadow-xs ring-1 ring-secondary sm:p-8">
          <p className="text-lg text-tertiary">{product.summary}</p>
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
          <div className="rounded-xl bg-primary p-5 shadow-xs ring-1 ring-secondary">
            <h2 className="text-sm font-semibold text-primary">Danger zone</h2>
            <p className="mt-2 text-sm text-tertiary">
              Products with quote requests cannot be deleted.
            </p>
            <Button
              className="mt-4 text-error-primary"
              color="secondary"
              isDisabled={isDeleting || product.enquiryCount > 0}
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
