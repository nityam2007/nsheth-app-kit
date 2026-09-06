import { requireRouteModule } from '../module-route'
import { TriageFields, triageData } from '../components/triage-fields'
import { HistoryList } from '../components/history-list'
import { createFileRoute } from '@tanstack/react-router'
import { useServerFn } from '@tanstack/react-start'
import {
  getPrivacyRequests,
  updatePrivacyRequest,
} from '../operations.functions'
import {
  ActionForm,
  EmptyState,
  PageHeading,
  SelectField,
} from '../components/workflow'

export const Route = createFileRoute('/admin/privacy')({
  beforeLoad: () => requireRouteModule('operations'),
  loader: () => getPrivacyRequests(),
  component: Requests,
})
function Requests() {
  const requests = Route.useLoaderData(),
    update = useServerFn(updatePrivacyRequest)
  return (
    <section>
      <PageHeading
        eyebrow="Operations"
        title="Privacy requests"
        description="Verify identity and applicable retention requirements before exporting, correcting, or erasing data. Status updates record triage; they do not erase records."
      />
      {!requests.length && <EmptyState>No requests yet.</EmptyState>}
      <div className="grid gap-5">
        {requests.map((r) => (
          <article
            key={r.id}
            className="rounded-xl border border-secondary p-6"
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
              <SelectField name="status" label="Status" defaultValue={r.status}>
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
