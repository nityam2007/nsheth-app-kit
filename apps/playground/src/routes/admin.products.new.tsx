import { Link, createFileRoute } from '@tanstack/react-router'

import { ProductForm } from '@/components/admin/product-form'

export const Route = createFileRoute('/admin/products/new')({
  component: NewProduct,
})

function NewProduct() {
  return (
    <section aria-labelledby="new-product-title">
      <Link
        className="text-sm font-semibold text-brand-secondary"
        to="/admin/products"
      >
        Products
      </Link>
      <header className="mt-5 border-b border-secondary pb-6">
        <p className="text-sm font-semibold text-brand-secondary">Catalogue</p>
        <h1
          className="mt-2 text-display-sm font-semibold text-primary"
          id="new-product-title"
        >
          New product
        </h1>
        <p className="mt-2 max-w-2xl text-md text-tertiary">
          Draft privately or publish immediately to the catalogue.
        </p>
      </header>
      <div className="mt-8">
        <ProductForm />
      </div>
    </section>
  )
}
