import { ObjectCollection, RecordTrail } from '../components/admin/workspace'
import { requireRouteModule } from '../module-route'
import { TriageFields, triageData } from '../components/triage-fields'
import { HistoryList } from '../components/history-list'
import { createFileRoute, notFound } from '@tanstack/react-router'
import { useServerFn } from '@tanstack/react-start'
import {
  getPrivacyRequests,
  updatePrivacyRequest,
} from '../operations.functions'
import { ActionForm, PageHeading, SelectField } from '../components/workflow'

export const Route = createFileRoute('/admin/privacy')({
  validateSearch: (search: Record<string, unknown>): { record?: string } => ({
    record: typeof search.record === 'string' ? search.record : undefined,
  }),
  beforeLoad: () => requireRouteModule('operations'),
  loaderDeps: ({ search }) => ({ record: search.record }),
  loader: ({ deps }) => getPrivacyRequests({ data: { record: deps.record } }),
  component: Requests,
})
function Requests() {
  const requests = Route.useLoaderData(),
    update = useServerFn(updatePrivacyRequest)
  const { record } = Route.useSearch()
  if (record && !requests.some((item) => item.id === record)) throw notFound()
  if (!record)
    return (
      <ObjectCollection
        title="Privacy requests"
        eyebrow="Inbox"
        description="Review each request, assign responsibility and keep a record of follow-up."
        objects={requests.map((r) => ({
          id: r.id,
          title: r.name,
          subtitle: r.request,
          status: r.status,
          href: '/admin/privacy?record=' + r.id,
          meta: [
            { label: 'Contact', value: r.email },
            {
              label: 'Received',
              value: r.createdAt.toISOString().slice(0, 10),
            },
          ],
        }))}
      />
    )
  return (
    <section>
      <RecordTrail href="/admin/privacy" label="Privacy requests" />
      <PageHeading
        eyebrow="Operations"
        title={requests.find((r) => r.id === record)!.name}
        description="Verify identity and applicable retention requirements before exporting, correcting, or erasing data. Status updates record triage; they do not erase records."
      />
      <div className="grid gap-5">
        {requests
          .filter((item) => item.id === record)
          .map((r) => (
            <article
              key={r.id}
              className="rounded-xl border border-secondary bg-primary p-6 sm:p-8"
            >
              <h2 className="font-semibold text-primary">
                {r.name} · {r.email}
              </h2>
              <p className="my-5 whitespace-pre-wrap text-tertiary">
                {r.request}
              </p>
              <p className="mb-4 text-xs text-tertiary">
                {r.id} · {r.createdAt.toISOString().slice(0, 10)}
              </p>
              <ActionForm
                label="Update request"
                action={(f) => {
                  const s = f.get('status')
                  return update({
                    data: {
                      id: r.id,
                      expectedVersion: r.version,
                      ...triageData(f),
                      status:
                        s === 'CLOSED'
                          ? 'CLOSED'
                          : s === 'REVIEWED'
                            ? 'REVIEWED'
                            : 'OPEN',
                    },
                  })
                }}
              >
                <TriageFields
                  followUpAt={r.followUpAt}
                  assigned={Boolean(r.assigneeId)}
                />
                <SelectField
                  name="status"
                  label="Status"
                  defaultValue={r.status}
                >
                  <option value="OPEN">Open</option>
                  <option value="REVIEWED">Reviewed</option>
                  <option value="CLOSED">Closed</option>
                </SelectField>
              </ActionForm>
              <HistoryList events={r.history} />
            </article>
          ))}
      </div>
    </section>
  )
}
