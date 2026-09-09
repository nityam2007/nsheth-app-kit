import { adminWorkflows, collectionSearch } from '../admin-workflows'
import { ObjectCollection, RecordTrail } from '../components/admin/workspace'
import { requireRouteModule } from '../module-route'
import { Route as AdminRoute } from './admin'
import { TriageFields, triageData } from '../components/triage-fields'
import { HistoryList } from '../components/history-list'
import { createFileRoute, notFound } from '@tanstack/react-router'
import { useServerFn } from '@tanstack/react-start'
import { getEnquiries, updateEnquiry } from '../operations.functions'
import { ActionForm, PageHeading, SelectField } from '../components/workflow'

export const Route = createFileRoute('/admin/enquiries')({
  beforeLoad: () => requireRouteModule('operations'),
  loaderDeps: ({ search }) => ({ record: search.record }),
  loader: ({ deps }) => getEnquiries({ data: { record: deps.record } }),
  validateSearch: (
    search: Record<string, unknown>,
  ): { record?: string; status?: string } => ({
    ...collectionSearch(search),
    record: typeof search.record === 'string' ? search.record : undefined,
  }),
  component: Enquiries,
})
function Enquiries() {
  const { principal } = AdminRoute.useRouteContext()
  const update = useServerFn(updateEnquiry)
  const data = Route.useLoaderData()
  const { record, status: collectionStatus } = Route.useSearch()
  if (record && !data.some((item) => item.id === record)) throw notFound()
  if (!record)
    return (
      <ObjectCollection
        key={collectionStatus}
        initialStatus={collectionStatus}
        guidance={adminWorkflows['/admin/enquiries']?.steps}
        title="Enquiries"
        eyebrow="Inbox"
        description="Product conversations, ownership and follow-up in one place."
        objects={data.map((e) => ({
          id: e.id,
          title: e.product.name,
          subtitle: e.name + ' · ' + e.message,
          status: e.status,
          href: '/admin/enquiries?record=' + e.id,
          meta: [
            { label: 'Quantity', value: String(e.quantity) },
            { label: 'Owner', value: e.assigneeId ? 'Assigned' : 'Unassigned' },
          ],
        }))}
      />
    )
  return (
    <section>
      <RecordTrail href="/admin/enquiries" label="Enquiries" />
      <PageHeading
        eyebrow="Operations"
        title={data.find((e) => e.id === record)!.product.name}
        description="Review the conversation, assign ownership and record the next step."
      />
      <div className="grid gap-5">
        {data
          .filter((e) => e.id === record)
          .map((e) => (
            <article
              key={e.id}
              className="rounded-xl border border-secondary bg-primary p-6 sm:p-8"
            >
              <h2 className="font-semibold text-primary">
                {e.product.name} · {e.quantity} units
              </h2>
              <p className="my-3 text-tertiary">
                {e.name} · <a href={`mailto:${e.email}`}>{e.email}</a>
              </p>
              <p className="mb-5 whitespace-pre-wrap text-secondary">
                {e.message}
              </p>
              <p className="mb-4 text-sm text-tertiary">
                {e.assigneeId === principal.userId
                  ? 'Assigned to you'
                  : e.assigneeId
                    ? 'Assigned to another operator'
                    : 'Unassigned'}{' '}
                ·{' '}
                {e.followUpAt
                  ? `Follow up ${e.followUpAt.toISOString().slice(0, 10)}`
                  : 'No follow-up scheduled'}
              </p>
              <ActionForm
                label="Update enquiry"
                action={async (f) => {
                  const status = f.get('status')
                  await update({
                    data: {
                      id: e.id,
                      expectedVersion: e.version,
                      ...triageData(f),
                      status:
                        status === 'CLOSED'
                          ? 'CLOSED'
                          : status === 'IN_PROGRESS'
                            ? 'IN_PROGRESS'
                            : 'NEW',
                    },
                  })
                }}
              >
                <TriageFields
                  followUpAt={e.followUpAt}
                  assigned={Boolean(e.assigneeId)}
                />
                <SelectField
                  label="Status"
                  name="status"
                  defaultValue={e.status}
                >
                  <option value="NEW">New</option>
                  <option value="IN_PROGRESS">In progress</option>
                  <option value="CLOSED">Closed</option>
                </SelectField>
              </ActionForm>
              <HistoryList events={e.history} />
            </article>
          ))}
      </div>
    </section>
  )
}
