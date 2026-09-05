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
  return (
    <section>
      <Link
        className="inline-flex min-h-11 items-center text-sm font-semibold text-brand-secondary"
        to="/shop"
      >
        ← The collection
      </Link>
      <div className="mt-8 grid gap-12 lg:grid-cols-2">
        {p.imageUrl ? (
          <img
            src={p.imageUrl}
            alt={p.name}
            className="aspect-square w-full rounded-xl bg-secondary object-cover"
            referrerPolicy="no-referrer"
          />
        ) : (
          <div
            className="flex aspect-square items-center justify-center rounded-xl bg-secondary text-display-xl text-quaternary"
            aria-hidden="true"
          >
            {p.name[0]}
          </div>
        )}
        <div>
          <p className="text-sm font-semibold text-brand-secondary">
            {p.category}
          </p>
          <h1 className="my-4 text-display-md font-semibold text-primary">
            {p.name}
          </h1>
          <p className="text-xl text-tertiary">{p.summary}</p>
          <p className="my-6 text-display-xs font-semibold text-primary">
            {money(p.price)}
          </p>
          <p className="mb-5 text-sm text-tertiary">
            {p.stock ? `${p.stock} in stock` : 'Sold out'}
          </p>
          <Button
            isDisabled={!p.stock}
            onPress={() => {
              cart.add({
                productId: p.id,
                name: p.name,
                slug: p.slug,
                price: p.price,
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
          <p className="mt-10 whitespace-pre-wrap leading-7 text-tertiary">
            {p.description}
          </p>
        </div>
      </div>
    </section>
  )
}
