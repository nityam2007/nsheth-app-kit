import { Button } from '../components/base/buttons/button'
import { createFileRoute, Link } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { useServerFn } from '@tanstack/react-start'
import { useRef, useState } from 'react'
import { useCart } from '../components/cart-provider'
import {
  ActionForm,
  EmptyState,
  PageHeading,
  controlClass,
} from '../components/workflow'
import { Input } from '../components/base/input/input'
import { TextArea } from '../components/base/textarea/textarea'
import { placeOrder, quoteCart, recoverCheckout } from '../commerce.functions'
import { money } from '../money'
import { startPayment } from '../payments.functions'

export const Route = createFileRoute('/shop/cart')({ component: Cart })
function Cart() {
  const { lines, setQuantity, clear } = useCart(),
    place = useServerFn(placeOrder),
    pay = useServerFn(startPayment),
    recover = useServerFn(recoverCheckout)
  const key = useRef('')
  const [attempted, setAttempted] = useState(false)
  const [recoveryMessage, setRecoveryMessage] = useState('')
  const [onlinePayment, setOnlinePayment] = useState(false)
  const [receipt, setReceipt] = useState<{
    reference: string
    totalAmount: number
  } | null>(null)
  const items = lines.map(({ productId, quantity }) => ({
    productId,
    quantity,
  }))
  const quote = useQuery({
    queryKey: ['cart-quote', items],
    queryFn: () => quoteCart({ data: items }),
    enabled: items.length > 0,
    retry: false,
  })
  return (
    <section>
      <PageHeading
        eyebrow="Your collection"
        title={receipt ? 'Thank you for your order' : 'Shopping cart'}
        description={
          receipt
            ? 'Your order is saved. The team will contact you to arrange offline payment and delivery.'
            : 'Review your items and delivery details.'
        }
      />
      {receipt ? (
        <div role="status" className="rounded-xl border border-secondary p-8">
          <p className="font-semibold text-primary">
            Order total {money(receipt.totalAmount)}
          </p>
          <p className="my-4 break-all text-sm text-tertiary">
            Reference: {receipt.reference}
          </p>
          <p className="mb-5 text-tertiary">
            No online payment has been taken.
          </p>
          {onlinePayment && (
            <div className="mb-5">
              <ActionForm
                label="Pay securely with Stripe"
                action={async () => {
                  const result = await pay({
                    data: { reference: receipt.reference, key: key.current },
                  })
                  window.location.assign(result.url)
                }}
              >
                {null}
              </ActionForm>
            </div>
          )}
          <Link to="/shop" className="font-semibold text-brand-secondary">
            Continue shopping →
          </Link>
        </div>
      ) : !lines.length ? (
        <EmptyState>
          Your cart is empty.{' '}
          <Link to="/shop" className="font-semibold text-brand-secondary">
            Explore the collection.
          </Link>
        </EmptyState>
      ) : (
        <div className="grid gap-12 lg:grid-cols-2">
          <section>
            <ul className="divide-y divide-secondary">
              {lines.map((l) => (
                <li
                  key={l.productId}
                  className="flex flex-wrap items-center justify-between gap-4 py-5"
                >
                  <div>
                    <Link
                      className="font-semibold text-primary"
                      to="/shop/$slug"
                      params={{ slug: l.slug }}
                    >
                      {l.name}
                    </Link>
                    <p className="mt-2 text-tertiary">
                      {money(
                        quote.data?.lines.find(
                          (q) => q.productId === l.productId,
                        )?.price ?? l.price,
                      )}{' '}
                      each
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <label className="sr-only" htmlFor={l.productId}>
                      Quantity for {l.name}
                    </label>
                    <input
                      className={`${controlClass} max-w-24`}
                      id={l.productId}
                      type="number"
                      min={1}
                      max={99}
                      value={l.quantity}
                      onChange={(e) => {
                        const n = Number(e.target.value)
                        if (Number.isInteger(n) && n > 0) {
                          key.current = ''
                          setQuantity(l.productId, n)
                        }
                      }}
                    />
                    <button
                      className="min-h-11 px-2 text-sm text-error-primary"
                      onClick={() => {
                        key.current = ''
                        setQuantity(l.productId, 0)
                      }}
                      type="button"
                    >
                      Remove
                    </button>
                  </div>
                </li>
              ))}
            </ul>
            {quote.isError ? (
              <p role="alert" className="my-5 text-error-primary">
                A product is unavailable or has insufficient stock. Reduce
                quantities or remove unavailable items.
              </p>
            ) : (
              <p className="my-6 text-xl font-semibold text-primary">
                {quote.data
                  ? `Total ${money(quote.data.totalAmount)}`
                  : 'Checking prices and stock…'}
              </p>
            )}
            {quote.data && (
              <dl className="mb-5 grid grid-cols-2 gap-3 text-sm text-tertiary">
                <dt>Items</dt>
                <dd>{money(quote.data.subtotal)}</dd>
                <dt>Delivery</dt>
                <dd>{money(quote.data.shippingFee)}</dd>
                <dt>Tax</dt>
                <dd>{money(quote.data.taxAmount)}</dd>
              </dl>
            )}
            <Button color="secondary" onPress={() => void quote.refetch()}>
              Refresh prices & availability
            </Button>
            {attempted && (
              <div className="mt-5">
                <ActionForm
                  label="Recover last checkout"
                  action={async () => {
                    const found = await recover({ data: { key: key.current } })
                    if (found) {
                      setReceipt(found)
                      clear()
                    } else {
                      key.current = ''
                      setAttempted(false)
                      setRecoveryMessage(
                        'No order was created. You can edit your details and place a new order.',
                      )
                    }
                  }}
                >
                  <p className="text-sm text-tertiary">
                    If checkout was interrupted, recover the original order
                    before starting again.
                  </p>
                </ActionForm>
              </div>
            )}
            {recoveryMessage && (
              <p role="status" className="mt-4 text-brand-secondary">
                {recoveryMessage}
              </p>
            )}
          </section>
          <section className="rounded-xl border border-secondary bg-secondary p-6">
            <h2 className="mb-6 text-xl font-semibold text-primary">
              Delivery details
            </h2>
            <ActionForm
              label="Place order · Pay offline"
              action={async (f) => {
                if (!quote.data || quote.isError)
                  throw new Error('Quote unavailable')
                key.current ||= Array.from(
                  crypto.getRandomValues(new Uint8Array(32)),
                  (b) => b.toString(16).padStart(2, '0'),
                ).join('')
                setAttempted(true)
                const result = await place({
                  data: {
                    key: key.current,
                    lines: items,
                    expectedTotal: quote.data.totalAmount,
                    name: String(f.get('name')),
                    email: String(f.get('email')),
                    address: String(f.get('address')),
                  },
                })
                setOnlinePayment(quote.data.onlinePayment)
                setReceipt(result)
                clear()
              }}
            >
              <Input
                label="Full name"
                name="name"
                isRequired
                minLength={2}
                maxLength={120}
                autoComplete="name"
              />
              <Input
                label="Email"
                name="email"
                type="email"
                isRequired
                maxLength={254}
                autoComplete="email"
              />
              <TextArea
                label="Delivery address"
                name="address"
                isRequired
                minLength={10}
                maxLength={1000}
                autoComplete="street-address"
              />
              <p className="text-sm text-tertiary">
                We use these details to fulfil your order.{' '}
                <a className="underline" href="/privacy">
                  Privacy details
                </a>
              </p>
            </ActionForm>
          </section>
        </div>
      )}
    </section>
  )
}
