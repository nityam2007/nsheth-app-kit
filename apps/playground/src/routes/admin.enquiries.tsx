import { createFileRoute } from '@tanstack/react-router'
import { useServerFn } from '@tanstack/react-start'
import { useQueryClient } from '@tanstack/react-query'
import { createCollection, useLiveQuery } from '@tanstack/react-db'
import { queryCollectionOptions } from '@tanstack/query-db-collection'
import { useState } from 'react'
import { getEnquiries, updateEnquiry } from '../operations.functions'
import {
  ActionForm,
  EmptyState,
  PageHeading,
  SelectField,
} from '../components/workflow'
import { Input } from '../components/base/input/input'

export const Route = createFileRoute('/admin/enquiries')({
  ssr: false,
  component: Enquiries,
})
function Enquiries() {
  const queryClient = useQueryClient(),
    update = useServerFn(updateEnquiry)
  const [collection] = useState(() =>
    createCollection(
      queryCollectionOptions({
        queryClient,
        queryKey: ['enquiry-inbox'],
        queryFn: () => getEnquiries(),
        getKey: (row) => row.id,
        refetchInterval: 30000,
      }),
    ),
  )
  const result = useLiveQuery((q) => q.from({ enquiry: collection }))
  const [search, setSearch] = useState('')
  const rows = result.data.filter((e) =>
    `${e.name} ${e.email} ${e.product.name} ${e.status}`
      .toLowerCase()
      .includes(search.toLowerCase()),
  )
  return (
    <section>
      <PageHeading
        eyebrow="Operations"
        title="Enquiry inbox"
        description="Latest 500 product enquiries. The inbox refreshes every 30 seconds."
      />
      <div className="mb-6 max-w-md">
        <Input label="Search enquiries" value={search} onChange={setSearch} />
      </div>
      {result.isError ? (
        <p role="alert" className="text-error-primary">
          Unable to load enquiries. Refresh or check your access.
        </p>
      ) : result.isLoading ? (
        <p className="text-tertiary">Loading enquiries…</p>
      ) : !rows.length ? (
        <EmptyState>No matching enquiries.</EmptyState>
      ) : null}
      <div className="grid gap-5">
        {rows.map((e) => (
          <article
            key={e.id}
            className="rounded-xl border border-secondary p-6"
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
            <ActionForm
              label="Update enquiry"
              action={async (f) => {
                const status = f.get('status')
                await update({
                  data: {
                    id: e.id,
                    status:
                      status === 'CLOSED'
                        ? 'CLOSED'
                        : status === 'IN_PROGRESS'
                          ? 'IN_PROGRESS'
                          : 'NEW',
                  },
                })
                await queryClient.invalidateQueries({
                  queryKey: ['enquiry-inbox'],
                })
              }}
            >
              <SelectField label="Status" name="status" defaultValue={e.status}>
                <option value="NEW">New</option>
                <option value="IN_PROGRESS">In progress</option>
                <option value="CLOSED">Closed</option>
              </SelectField>
            </ActionForm>
          </article>
        ))}
      </div>
    </section>
  )
}
