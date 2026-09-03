import { createFileRoute } from '@tanstack/react-router'

import { getAdminUsers } from '../admin.functions'

export const Route = createFileRoute('/admin/users')({
  loader: () => getAdminUsers(),
  component: UsersResource,
})

function UsersResource() {
  const users = Route.useLoaderData()

  return (
    <section aria-labelledby="users-title">
      <header className="flex flex-col gap-5 border-b border-secondary pb-6 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-semibold text-brand-secondary">Identity</p>
          <h1
            className="mt-2 text-display-sm font-semibold text-primary"
            id="users-title"
          >
            People and access
          </h1>
        </div>
        <span className="text-sm text-tertiary">{users.length} records</span>
      </header>

      <p className="mt-6 max-w-3xl text-md text-tertiary">
        Users, assigned roles, and identity records available to this
        administrator. This first resource is intentionally read-only.
      </p>

      <div
        className="mt-8 overflow-x-auto rounded-xl bg-primary shadow-xs ring-1 ring-secondary focus:outline-2 focus:outline-offset-2 focus:outline-brand"
        role="region"
        aria-label="People and roles"
        tabIndex={0}
      >
        <table className="w-full min-w-176 border-collapse text-left">
          <thead className="border-b border-secondary bg-secondary">
            <tr>
              {['Person', 'Email', 'Roles', 'Created'].map((heading) => (
                <th
                  className="px-6 py-3 text-xs font-semibold text-tertiary"
                  key={heading}
                  scope="col"
                >
                  {heading}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-secondary">
            {users.length ? (
              users.map((user) => (
                <tr className="hover:bg-primary_hover" key={user.id}>
                  <th
                    className="px-6 py-4 text-sm font-medium text-primary"
                    scope="row"
                  >
                    {user.name ?? 'Unnamed user'}
                  </th>
                  <td className="px-6 py-4 text-sm text-tertiary">
                    {user.email}
                  </td>
                  <td className="px-6 py-4 text-sm text-tertiary">
                    {user.roles.join(', ') || 'Unassigned'}
                  </td>
                  <td className="px-6 py-4 text-sm text-tertiary">
                    {user.createdAt}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  className="px-6 py-12 text-center text-sm text-tertiary"
                  colSpan={4}
                >
                  No identity records yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  )
}
