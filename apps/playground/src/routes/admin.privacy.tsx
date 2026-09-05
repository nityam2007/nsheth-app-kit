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
              <SelectField name="status" label="Status" defaultValue={r.status}>
                <option value="OPEN">Open</option>
                <option value="REVIEWED">Reviewed</option>
                <option value="CLOSED">Closed</option>
              </SelectField>
            </ActionForm>
          </article>
        ))}
      </div>
    </section>
  )
}
