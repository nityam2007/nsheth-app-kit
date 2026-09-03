import { Link, createFileRoute, notFound } from '@tanstack/react-router'

import { ProductForm } from '@/components/admin/product-form'

import { getAdminProduct } from '../product.functions'

export const Route = createFileRoute('/admin/products/$slug/edit')({
  loader: async ({ params }) => {
    const product = await getAdminProduct({ data: { slug: params.slug } })
    if (!product) throw notFound()
    return product
  },
  component: EditProduct,
})

function EditProduct() {
  const product = Route.useLoaderData()

  return (
    <section aria-labelledby="edit-product-title">
      <Link
        className="text-sm font-semibold text-brand-secondary"
        to="/admin/products/$slug"
        params={{ slug: product.slug }}
      >
        {product.name}
      </Link>
      <header className="mt-5 border-b border-secondary pb-6">
        <p className="text-sm font-semibold text-brand-secondary">Catalogue</p>
        <h1
          className="mt-2 text-display-sm font-semibold text-primary"
          id="edit-product-title"
        >
          Edit product
        </h1>
        <p className="mt-2 max-w-2xl text-md text-tertiary">
          Update the catalogue entry or change its publication state.
        </p>
      </header>
      <div className="mt-8">
        <ProductForm currentSlug={product.slug} initial={product} />
      </div>
    </section>
  )
}
