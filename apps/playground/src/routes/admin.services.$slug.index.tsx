import { createFileRoute, Link } from '@tanstack/react-router'
import { useServerFn } from '@tanstack/react-start'
import { Route as Parent } from './admin.services.$slug'
import {
  addAvailability,
  deleteAdminService,
  removeAvailability,
} from '../booking.functions'
import { ActionForm, PageHeading } from '../components/workflow'
import { Input } from '../components/base/input/input'

export const Route = createFileRoute('/admin/services/$slug/')({
  component: Detail,
})
function Detail() {
  const service = Parent.useLoaderData()
  const add = useServerFn(addAvailability),
    remove = useServerFn(removeAvailability),
    destroy = useServerFn(deleteAdminService)
  return (
    <section>
      <PageHeading
        eyebrow={`Booking · ${service.status}`}
        title={service.name}
        description={service.summary}
      />
      <div className="mb-8 flex gap-6">
        <Link
          className="text-brand-secondary"
          to="/admin/services/$slug/edit"
          params={{ slug: service.slug }}
        >
          Edit service
        </Link>
        {service.status === 'PUBLISHED' && (
          <Link
            className="text-brand-secondary"
            to="/services/$slug"
            params={{ slug: service.slug }}
          >
            View public page
          </Link>
        )}
      </div>
      <p className="mb-10 max-w-3xl whitespace-pre-wrap text-tertiary">
        {service.description}
      </p>
      <div className="grid gap-10 lg:grid-cols-2">
        <section>
          <h2 className="mb-5 text-xl font-semibold text-primary">
            Add availability
          </h2>
          <p className="mb-5 text-sm text-tertiary">
            Enter your local time. Slots are stored as absolute instants and
            displayed in the visitor’s timezone. Duration:{' '}
            {service.durationMinutes} minutes.
          </p>
          <ActionForm
            reset
            label="Add slot"
            action={(form) =>
              add({
                data: {
                  serviceId: service.id,
                  startsAt: new Date(
                    String(form.get('startsAt')),
                  ).toISOString(),
                  capacity: Number(form.get('capacity')),
                },
              })
            }
          >
            <Input
              label="Starts at (your local time)"
              name="startsAt"
              type="datetime-local"
              isRequired
            />
            <Input
              label="Capacity"
              name="capacity"
              type="number"
              min={1}
              max={100}
              defaultValue="1"
              isRequired
            />
          </ActionForm>
        </section>
        <section>
          <h2 className="mb-5 text-xl font-semibold text-primary">
            Scheduled slots
          </h2>
          <ul className="grid gap-5">
            {service.slots.map((s) => (
              <li key={s.id} className="rounded-lg border border-secondary p-4">
                <p className="mb-3 text-secondary">
                  {s.startsAt.toISOString().replace('T', ' ').slice(0, 16)} UTC
                  · {s.capacity} places · {s._count.bookings} requests
                </p>
                {s._count.bookings === 0 && (
                  <ActionForm
                    label="Remove slot"
                    action={() => remove({ data: { id: s.id } })}
                  >
                    {null}
                  </ActionForm>
                )}
              </li>
            ))}
          </ul>
          {!service.slots.length && (
            <p className="text-tertiary">No slots yet.</p>
          )}
        </section>
      </div>
      <section className="mt-12 border-t border-secondary pt-8">
        <h2 className="mb-3 font-semibold text-primary">Delete service</h2>
        <p className="mb-5 text-tertiary">
          Services with booking history cannot be deleted. Unpublish them
          instead.
        </p>
        <ActionForm
          label="Delete service"
          action={async () => {
            if (!window.confirm('Delete this service and its empty slots?'))
              return
            await destroy({ data: { slug: service.slug } })
            return '/admin/services'
          }}
        >
          {null}
        </ActionForm>
      </section>
    </section>
  )
}
