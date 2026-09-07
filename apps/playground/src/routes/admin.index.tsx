import { createFileRoute } from '@tanstack/react-router'
import { getWorkspaceOverview, getWorkspaceActivity } from '../admin.functions'
import {
  MetricStrip,
  SectionPanel,
  WorkspaceHeading,
} from '../components/admin/workspace'

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
  const groups = [...new Set(metrics.map((m) => m.group))]
  return (
    <section>
      <WorkspaceHeading
        eyebrow="Workspace overview"
        title="Make room for good work."
        description="Your content, customers and day-to-day operations, in one place."
        action={
          <a href="/" className="admin-secondary-link">
            View your site ↗
          </a>
        }
      />
      <MetricStrip
        items={[
          {
            label: 'Needs attention',
            value: attention.reduce((n, m) => n + m.pending, 0),
            note: 'Drafts and open work across your modules',
          },
          {
            label: 'Active areas',
            value: groups.length,
            note: 'Available for your role',
          },
          {
            label: 'Managed objects',
            value: metrics.reduce((n, m) => n + m.total, 0),
            note: 'Across your permitted collections',
          },
          {
            label: 'Collections',
            value: metrics.length,
            note: 'Choose a collection to continue',
          },
        ]}
      />
      <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,1fr)_22rem]">
        <div className="grid gap-6">
          {groups.map((group) => (
            <SectionPanel
              key={group}
              title={group}
              description={`Manage your ${group.toLowerCase()} workspace`}
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
                            {m.total} {m.total === 1 ? 'record' : 'records'}
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
        <div className="grid gap-6">
          <SectionPanel
            title="Needs your attention"
            description="A useful place to start today"
          >
            {attention.length ? (
              <ul className="grid gap-5">
                {attention.map((m) => (
                  <li key={m.id}>
                    <a href={m.href} className="flex items-start gap-3">
                      <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-brand-primary text-sm font-semibold text-brand-secondary">
                        {m.pending}
                      </span>
                      <span>
                        <strong className="text-sm text-primary">
                          {m.label}
                        </strong>
                        <span className="mt-1 block text-sm text-tertiary">
                          Review open work →
                        </span>
                      </span>
                    </a>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm leading-6 text-tertiary">
                You’re caught up. Open a collection to create something new or
                review your existing objects.
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
