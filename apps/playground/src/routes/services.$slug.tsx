import { newRequestKey } from '../request-key'
import { createFileRoute, notFound } from '@tanstack/react-router'
import { useServerFn } from '@tanstack/react-start'
import { useEffect, useState, useRef } from 'react'
import { getService, requestBooking } from '../booking.functions'
import {
  ActionForm,
  EmptyState,
  PageHeading,
  SelectField,
} from '../components/workflow'
import { Input } from '../components/base/input/input'
import { TextArea } from '../components/base/textarea/textarea'

export const Route = createFileRoute('/services/$slug')({
  loader: async ({ params }) => {
    const service = await getService({ data: params })
    if (!service) throw notFound()
    return service
  },
  head: ({ loaderData }) => ({
    meta: [{ title: `${loaderData?.name ?? 'Service'} | NSheth App Kit` }],
  }),
  component: Service,
})
function Service() {
  const service = Route.useLoaderData(),
    request = useServerFn(requestBooking)
  const key = useRef('')
  const [reference, setReference] = useState(''),
    [local, setLocal] = useState(false)
  useEffect(() => {
    setLocal(true)
  }, [])
  return (
    <section>
      <PageHeading
        eyebrow={`${service.durationMinutes} minute appointments`}
        title={service.name}
        description={service.summary}
      />
      <div className="grid gap-12 lg:grid-cols-2">
        <div>
          <p className="whitespace-pre-wrap leading-7 text-tertiary">
            {service.description}
          </p>
          <dl className="mt-6 grid gap-3 text-secondary">
            <dt>Where</dt>
            <dd>
              {service.location || 'The team will send meeting instructions.'}
            </dd>
            <dt>Booking window</dt>
            <dd>
              At least {service.minLeadHours} hours ahead; up to{' '}
              {service.maxAdvanceDays} days.
            </dd>
            <dt>Online cancellation</dt>
            <dd>
              Until {service.cancelNoticeHours} hours before the appointment,
              through your verified-email account.
            </dd>
          </dl>
          <p className="mt-5 whitespace-pre-wrap text-tertiary">
            {service.policy}
          </p>
        </div>
        <section className="rounded-xl border border-secondary bg-secondary p-6 sm:p-8">
          <h2 className="mb-5 text-xl font-semibold text-primary">
            Request an appointment
          </h2>
          {reference ? (
            <div role="status">
              <p className="font-semibold text-primary">
                Your request has been received.
              </p>
              <p className="mt-3 text-tertiary">
                The team will contact you to confirm. Keep this reference:
              </p>
              <p className="mt-2 break-all text-sm text-brand-secondary">
                {reference}
              </p>
            </div>
          ) : !service.slots.length ? (
            <EmptyState>
              No appointments available right now. Please check back later.
            </EmptyState>
          ) : (
            <ActionForm
              label="Request appointment"
              action={async (form) => {
                const result = await request({
                  data: {
                    key: (key.current ||= newRequestKey()),
                    slotId: String(form.get('slotId')),
                    name: String(form.get('name')),
                    email: String(form.get('email')),
                    notes: String(form.get('notes')),
                  },
                })
                setReference(result.reference)
              }}
            >
              <SelectField
                label={
                  local
                    ? 'Available times (your timezone)'
                    : 'Available times (UTC)'
                }
                name="slotId"
              >
                {service.slots.map((s) => (
                  <option key={s.id} value={s.id}>
                    {local
                      ? s.startsAt.toLocaleString()
                      : s.startsAt.toISOString()}{' '}
                    · {s.remaining} remaining
                  </option>
                ))}
              </SelectField>
              <Input
                label="Your name"
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
                label="Anything we should know?"
                name="notes"
                maxLength={2000}
              />
              <p className="text-sm text-tertiary">
                We use these details to respond to your request. This is a
                request, subject to confirmation by the team.
              </p>
            </ActionForm>
          )}
        </section>
      </div>
    </section>
  )
}
