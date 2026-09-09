import { createFileRoute } from '@tanstack/react-router'
import { useServerFn } from '@tanstack/react-start'
import { Route as Parent } from './admin.services.$slug'
import {
  addAvailability,
  pauseAvailability,
  removeAvailability,
} from '../booking.functions'
import { ActionForm, controlClass } from '../components/workflow'
import { Input } from '../components/base/input/input'
import { WorkspaceHeading, RecordTrail } from '../components/admin/workspace'

export const Route = createFileRoute('/admin/services/$slug/availability')({
  component: Availability,
})
function Availability() {
  const service = Parent.useLoaderData(),
    add = useServerFn(addAvailability),
    pause = useServerFn(pauseAvailability),
    remove = useServerFn(removeAvailability)
  return (
    <section>
      <RecordTrail
        current="Available times"
        href={'/admin/services/' + service.slug}
        label={service.name}
      />
      <WorkspaceHeading
        eyebrow="Schedule / Availability"
        title={service.name}
        description="Create bookable times, review capacity and pause new requests."
      />{' '}
      <div className="grid gap-10 lg:grid-cols-2">
        <section className="rounded-xl border border-secondary bg-primary p-6">
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
            <label className="grid gap-2 text-sm font-medium text-secondary">
              Starts at (your local time)
              <input
                className={controlClass}
                name="startsAt"
                type="datetime-local"
                required
              />
            </label>
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
        <section className="rounded-xl border border-secondary bg-primary p-6">
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
                <ActionForm
                  label={s.paused ? 'Reopen slot' : 'Pause new requests'}
                  action={() =>
                    pause({ data: { id: s.id, paused: !s.paused } })
                  }
                >
                  <p className="text-sm text-tertiary">
                    {s.paused
                      ? 'Paused. Existing requests remain valid.'
                      : 'Open for new requests.'}
                  </p>
                </ActionForm>
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
    </section>
  )
}
