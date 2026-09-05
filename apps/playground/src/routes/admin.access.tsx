import { createFileRoute } from '@tanstack/react-router'
import { useServerFn } from '@tanstack/react-start'
import { getAccessUsers, updateAccess } from '../account.functions'
import { ActionForm, PageHeading, SelectField } from '../components/workflow'

export const Route = createFileRoute('/admin/access')({
  loader: () => getAccessUsers(),
  component: Access,
})
function Access() {
  const users = Route.useLoaderData(),
    update = useServerFn(updateAccess)
  return (
    <section>
      <PageHeading
        eyebrow="Identity"
        title="Team access"
        description="Users sign in first. Assign a role to give them a workspace. Changes revoke their current sessions; you cannot change your own access."
      />
      <div className="grid gap-6 lg:grid-cols-2">
        {users.map((u) => (
          <article
            key={u.id}
            className="rounded-xl border border-secondary p-6"
          >
            <h2 className="mb-2 font-semibold text-primary">
              {u.name ?? u.email}
            </h2>
            <p className="mb-5 text-sm text-tertiary">
              {u.email} · {u.roles.map((r) => r.role.key).join(', ')}
            </p>
            <ActionForm
              label="Update access"
              action={(f) => {
                const role = f.get('role')
                return update({
                  data: {
                    userId: u.id,
                    role:
                      role === 'admin'
                        ? 'admin'
                        : role === 'staff'
                          ? 'staff'
                          : role === 'editor'
                            ? 'editor'
                            : 'customer',
                    disabled: f.get('disabled') === 'true',
                  },
                })
              }}
            >
              <SelectField
                name="role"
                label="Role"
                defaultValue={
                  u.roles.find((r) => r.role.key !== 'customer')?.role.key ??
                  'customer'
                }
              >
                <option value="customer">Customer — own activity only</option>
                <option value="editor">Editor — content and catalogue</option>
                <option value="staff">
                  Staff — bookings, stays, orders, inbox
                </option>
                <option value="admin">
                  Admin — all modules and team access
                </option>
              </SelectField>
              <SelectField
                name="disabled"
                label="Account status"
                defaultValue={String(Boolean(u.disabledAt))}
              >
                <option value="false">Active</option>
                <option value="true">Disabled</option>
              </SelectField>
            </ActionForm>
          </article>
        ))}
      </div>
    </section>
  )
}
