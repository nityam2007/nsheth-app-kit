import { hasPermission } from '@nsheth/identity'
import { createFileRoute, Link } from '@tanstack/react-router'
import { useServerFn } from '@tanstack/react-start'
import { Route as Parent } from './admin.services.$slug'
import { deleteAdminService } from '../booking.functions'
import { ActionForm, PageHeading } from '../components/workflow'
import {
  NextStep,
  MetricStrip,
  SectionPanel,
  RecordTrail,
} from '../components/admin/workspace'

export const Route = createFileRoute('/admin/services/$slug/')({
  component: Detail,
})
function Detail() {
  const service = Parent.useLoaderData()
  const destroy = useServerFn(deleteAdminService)
  const canEdit = hasPermission(
    Route.useRouteContext().principal,
    'booking.write',
  )
  const hasSlots = service.slots.some(
    (slot) => !slot.paused && new Date(slot.startsAt).getTime() > Date.now(),
  )
  return (
    <section>
      <RecordTrail href="/admin/services" label="Services" />
      <PageHeading
        eyebrow={`Booking · ${service.status}`}
        title={service.name}
        description={service.summary}
      />
      {canEdit && (!hasSlots || service.status === 'DRAFT') && (
        <NextStep
          title={
            !hasSlots
              ? 'Add upcoming appointment times'
              : 'Publish your service when it is ready'
          }
          description={
            !hasSlots
              ? 'Choose the dates, times and capacity you want to offer. Guests can request appointments within your booking window after you publish.'
              : 'Your upcoming times are configured. Review the details and change Publication to Published so customers can find this service.'
          }
          href={
            '/admin/services/' +
            service.slug +
            (!hasSlots ? '/availability' : '/edit')
          }
          label={!hasSlots ? 'Add available times' : 'Review & publish'}
        />
      )}
      <div className="mb-8 flex flex-wrap gap-3">
        <a
          className="admin-primary-link"
          href={'/admin/services/' + service.slug + '/availability'}
        >
          Manage availability
        </a>
        <Link
          className="admin-secondary-link"
          to="/admin/services/$slug/edit"
          params={{ slug: service.slug }}
        >
          Edit service
        </Link>
        {service.status === 'PUBLISHED' && (
          <Link
            className="admin-secondary-link"
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
      <MetricStrip
        items={[
          { label: 'Duration', value: service.durationMinutes + ' min' },
          { label: 'Slots', value: service.slots.length },
          { label: 'Minimum notice', value: service.minLeadHours + ' hours' },
          { label: 'Booking horizon', value: service.maxAdvanceDays + ' days' },
        ]}
      />
      <div className="mb-8 grid gap-6 lg:grid-cols-2">
        <SectionPanel title="Location & time">
          <p className="text-secondary">
            {service.location || 'No location specified'}
          </p>
          <p className="mt-3 text-sm text-tertiary">{service.timezone}</p>
        </SectionPanel>
        <SectionPanel title="Booking policy">
          <p className="whitespace-pre-wrap text-tertiary">
            {service.policy || 'No additional policy.'}
          </p>
          <p className="mt-4 text-sm text-secondary">
            Cancellation notice: {service.cancelNoticeHours} hours
          </p>
        </SectionPanel>
      </div>{' '}
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
              return false
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
