import { hasPermission } from '@nsheth/identity'
import { adminWorkflows } from '../admin-workflows'
import { createFileRoute } from '@tanstack/react-router'
import { getWorkspaceOverview, getWorkspaceActivity } from '../admin.functions'
import { SectionPanel, WorkspaceHeading } from '../components/admin/workspace'

export const Route = createFileRoute('/admin/')({
  loader: async () => {
    const [metrics, activity] = await Promise.all([
      getWorkspaceOverview(),
      getWorkspaceActivity(),
    ])
    return { metrics, activity }
  },
  component: Dashboard,
})
function Dashboard() {
  const { metrics, activity } = Route.useLoaderData(),
    attention = metrics.filter((m) => m.pending > 0)
  const { principal } = Route.useRouteContext()
  const starters = metrics.filter(
    (m) =>
      adminWorkflows[m.href]?.createLabel &&
      hasPermission(principal, m.permission.replace('.read', '.write')),
  )
  const groups = [...new Set(metrics.map((m) => m.group))]
  return (
    <section>
      <WorkspaceHeading
        eyebrow="Workspace overview"
        title="Overview"
        description="Your requests, content and business settings."
        action={
          <a href="/" className="admin-secondary-link">
            View your site ↗
          </a>
        }
      />
      {starters.length > 0 && (
        <section className="mb-8" aria-labelledby="start-task-title">
          <h2
            id="start-task-title"
            className="mb-4 text-xl font-semibold text-primary"
          >
            Create new
          </h2>
          <ul className="grid gap-4 sm:grid-cols-2">
            {starters.map((m) => (
              <li
                key={m.id}
                className="rounded-xl border border-secondary bg-primary p-5 shadow-xs"
              >
                <a
                  className="inline-flex min-h-11 items-center text-lg font-semibold text-brand-secondary"
                  href={m.href + '/new'}
                >
                  {adminWorkflows[m.href]?.createLabel} →
                </a>
                <p className="mt-2 text-sm leading-6 text-tertiary">
                  {adminWorkflows[m.href]?.description}
                </p>
              </li>
            ))}
          </ul>
        </section>
      )}
      <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,1fr)_22rem]">
        <div className="grid gap-6">
          {groups.map((group) => (
            <SectionPanel
              key={group}
              title={group}
              description={
                group === 'Sell'
                  ? 'Create products, then manage orders.'
                  : group === 'Schedule'
                    ? 'Set up services, then manage appointment requests.'
                    : group === 'Host'
                      ? 'Set up rooms, then manage guest reservations.'
                      : group === 'Publish'
                        ? 'Write, review and publish articles.'
                        : group === 'People'
                          ? 'Manage accounts and team access.'
                          : 'Review requests and record your follow-up.'
              }
            >
              <ul className="divide-y divide-secondary">
                {metrics
                  .filter((m) => m.group === group)
                  .map((m) => (
                    <li key={m.id}>
                      <a
                        href={m.href}
                        className="flex min-h-20 items-center justify-between gap-4 py-4 outline-brand focus-visible:outline-2"
                      >
                        <div>
                          <h3 className="font-semibold text-primary">
                            {m.label}
                          </h3>
                          <p className="mt-1 text-sm text-tertiary">
                            {adminWorkflows[m.href]?.description} · {m.total}{' '}
                            {m.total === 1 ? 'record' : 'records'}
                            {m.pending > 0
                              ? ` · ${m.pending} awaiting action`
                              : ''}
                          </p>
                        </div>
                        <span
                          className="text-brand-secondary"
                          aria-hidden="true"
                        >
                          →
                        </span>
                      </a>
                    </li>
                  ))}
              </ul>
            </SectionPanel>
          ))}
        </div>
        <div className="grid gap-6" id="attention">
          <SectionPanel
            title="Needs your attention"
            description="A useful place to start today"
          >
            {attention.length ? (
              <ul className="grid gap-5">
                {attention.map((m) => (
                  <li key={m.id}>
                    <a
                      href={
                        m.href +
                        (adminWorkflows[m.href]?.pendingStatus
                          ? `?status=${adminWorkflows[m.href]?.pendingStatus}`
                          : '')
                      }
                      className="flex min-h-11 items-start gap-3"
                    >
                      <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-brand-primary text-sm font-semibold text-brand-secondary">
                        {m.pending}
                      </span>
                      <span>
                        <strong className="text-sm text-primary">
                          {m.label}
                        </strong>
                        <span className="mt-1 block text-sm text-tertiary">
                          {adminWorkflows[m.href]?.pendingLabel ??
                            'Review open work'}{' '}
                          →
                        </span>
                      </span>
                    </a>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm leading-6 text-tertiary">
                You’re caught up. Open a collection to create something new or
                review your existing records.
              </p>
            )}
          </SectionPanel>
          <SectionPanel
            title="Recent activity"
            description="Latest changes in your permitted modules"
          >
            {activity.length ? (
              <ol className="grid gap-5">
                {activity.map((event) => (
                  <li
                    key={event.id}
                    className="border-l-2 border-secondary pl-4"
                  >
                    <p className="text-sm font-medium text-secondary">
                      {event.summary}
                    </p>
                    <p className="mt-1 text-xs text-tertiary">
                      {event.entityType} ·{' '}
                      {event.createdAt
                        .toISOString()
                        .slice(0, 16)
                        .replace('T', ' ')}{' '}
                      UTC
                    </p>
                  </li>
                ))}
              </ol>
            ) : (
              <p className="text-sm text-tertiary">
                Changes to your records will appear here.
              </p>
            )}
          </SectionPanel>
        </div>
      </div>
    </section>
  )
}
