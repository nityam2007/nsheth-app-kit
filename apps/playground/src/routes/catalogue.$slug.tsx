import { ArrowLeft } from '@untitledui/icons'
import { Link, createFileRoute, notFound } from '@tanstack/react-router'
import { useServerFn } from '@tanstack/react-start'
import { useState } from 'react'

import { Button } from '@/components/base/buttons/button'
import { Input } from '@/components/base/input/input'
import { TextArea } from '@/components/base/textarea/textarea'
import { Container } from '@/components/container'

import { getPublishedProduct, submitProductEnquiry } from '../product.functions'

export const Route = createFileRoute('/catalogue/$slug')({
  loader: async ({ params }) => {
    const product = await getPublishedProduct({ data: { slug: params.slug } })
    if (!product) throw notFound()
    return product
  },
  head: ({ loaderData }) => ({
    meta: loaderData
      ? [
          { title: `${loaderData.name} | NSheth App Kit` },
          { name: 'description', content: loaderData.summary },
        ]
      : [],
  }),
  component: ProductDetail,
})

function ProductDetail() {
  const product = Route.useLoaderData()
  const submitEnquiry = useServerFn(submitProductEnquiry)
  const [error, setError] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const form = event.currentTarget
    const formData = new FormData(form)

    setError('')
    setSubmitted(false)
    setIsSaving(true)

    try {
      await submitEnquiry({
        data: {
          productId: product.id,
          name: String(formData.get('name') ?? ''),
          email: String(formData.get('email') ?? ''),
          quantity: Number(formData.get('quantity')),
          message: String(formData.get('message') ?? ''),
        },
      })
      form.reset()
      setSubmitted(true)
    } catch {
      setError('Could not send this request. Check the fields and try again.')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <article className="py-12 sm:py-20">
      <Container>
        <Link
          className="inline-flex items-center gap-2 text-sm font-semibold text-brand-secondary hover:text-brand-secondary_hover"
          to="/catalogue"
        >
          <ArrowLeft aria-hidden="true" className="size-5" />
          All products
        </Link>

        <div className="mt-10 grid items-start gap-12 lg:grid-cols-[minmax(0,1fr)_25rem] lg:gap-20">
          <div>
            <header className="border-b border-secondary pb-10">
              <p className="text-sm font-semibold text-brand-secondary">
                Product
              </p>
              <h1 className="mt-3 text-display-md font-semibold text-primary sm:text-display-lg">
                {product.name}
              </h1>
              <p className="mt-5 max-w-2xl text-lg text-tertiary sm:text-xl">
                {product.summary}
              </p>
            </header>
            <div className="mt-10 max-w-3xl whitespace-pre-wrap text-md leading-8 text-secondary sm:text-lg">
              {product.description}
            </div>
          </div>

          <aside
            className="rounded-xl bg-secondary p-5 ring-1 ring-secondary sm:p-6"
            aria-labelledby="quote-title"
          >
            <h2
              className="text-display-xs font-semibold text-primary"
              id="quote-title"
            >
              Request a quote
            </h2>
            <p className="mt-2 text-sm text-tertiary">
              Tell us the quantity and context. This development demo stores
              submissions, so do not enter real personal data.
            </p>
            <form className="mt-6 grid gap-5" onSubmit={handleSubmit}>
              <Input
                autoComplete="name"
                isRequired
                label="Name"
                maxLength={120}
                minLength={2}
                name="name"
              />
              <Input
                autoComplete="email"
                isRequired
                label="Email"
                maxLength={254}
                name="email"
                spellCheck="false"
                type="email"
              />
              <Input
                defaultValue="1"
                isRequired
                label="Quantity"
                max={1000000}
                min={1}
                name="quantity"
                step={1}
                type="number"
              />
              <TextArea
                isRequired
                label="Project details"
                maxLength={2000}
                minLength={10}
                name="message"
                rows={5}
              />
              <div aria-live="polite">
                {error ? (
                  <p className="m-0 text-sm text-error-primary" role="alert">
                    {error}
                  </p>
                ) : null}
                {submitted ? (
                  <p className="m-0 text-sm font-medium text-success-primary">
                    Request received.
                  </p>
                ) : null}
              </div>
              <Button
                className="w-full sm:w-auto sm:justify-self-start"
                isDisabled={isSaving}
                isLoading={isSaving}
                showTextWhileLoading
                type="submit"
              >
                Send request
              </Button>
            </form>
          </aside>
        </div>
      </Container>
    </article>
  )
}
