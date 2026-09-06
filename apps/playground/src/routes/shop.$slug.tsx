import {
  ProductGallery,
  ProductSpecifications,
} from '../components/product-information'
import { controlClass } from '../components/workflow'
import { createFileRoute, Link, notFound } from '@tanstack/react-router'
import { useState } from 'react'
import { getStoreProduct } from '../commerce.functions'
import { useCart } from '../components/cart-provider'
import { Button } from '../components/base/buttons/button'
import { money } from '../money'

export const Route = createFileRoute('/shop/$slug')({
  loader: async ({ params }) => {
    const p = await getStoreProduct({ data: params })
    if (!p) throw notFound()
    return p
  },
  head: ({ loaderData }) => ({
    meta: [
      { title: `${loaderData?.name ?? 'Product'} | NSheth App Kit` },
      { name: 'description', content: loaderData?.summary ?? '' },
    ],
  }),
  component: Product,
})
function Product() {
  const p = Route.useLoaderData(),
    cart = useCart()
  const [added, setAdded] = useState(false)
  const [optionId, setOptionId] = useState(p.options[0]?.id ?? p.id)
  const selection = p.options.find((option) => option.id === optionId) ?? p
  return (
    <section>
      <Link
        className="inline-flex min-h-11 items-center text-sm font-semibold text-brand-secondary"
        to="/shop"
      >
        ← The collection
      </Link>
      <div className="mt-8 grid gap-12 lg:grid-cols-2">
        <ProductGallery
          images={
            p.gallery.length
              ? p.gallery
              : p.imageUrl
                ? [{ url: p.imageUrl, alt: p.name }]
                : []
          }
          name={p.name}
        />
        <div>
          <p className="text-sm font-semibold text-brand-secondary">
            {p.category}
          </p>
          <h1 className="my-4 text-display-md font-semibold text-primary">
            {p.name}
          </h1>
          <p className="text-xl text-tertiary">{p.summary}</p>
          <p className="my-6 text-display-xs font-semibold text-primary">
            {money(selection.price)}
          </p>
          <p className="mb-5 text-sm text-tertiary">
            {selection.stock ? `${selection.stock} in stock` : 'Sold out'}
          </p>
          {p.options.length > 0 && (
            <label className="mb-5 grid gap-2 text-sm font-medium text-secondary">
              Choose an option
              <select
                className={controlClass}
                value={optionId}
                onChange={(event) => {
                  setOptionId(event.target.value)
                  setAdded(false)
                }}
              >
                {p.options.map((option) => (
                  <option key={option.id} value={option.id}>
                    {option.optionLabel} · {money(option.price)}
                    {!option.stock ? ' · Sold out' : ''}
                  </option>
                ))}
              </select>
            </label>
          )}
          <Button
            isDisabled={!selection.stock}
            onPress={() => {
              cart.add({
                productId: selection.id,
                name: selection.name,
                slug: selection.slug,
                price: selection.price,
              })
              setAdded(true)
            }}
          >
            Add to cart
          </Button>
          {added && (
            <p role="status" className="mt-4 text-brand-secondary">
              Added to your cart.{' '}
              <Link to="/shop/cart" className="font-semibold underline">
                Review cart →
              </Link>
            </p>
          )}
          <ProductSpecifications {...p} sku={selection.sku} />
          <p className="mt-10 whitespace-pre-wrap leading-7 text-tertiary">
            {p.description}
          </p>
        </div>
      </div>
    </section>
  )
}
