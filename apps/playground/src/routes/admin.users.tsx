import { createFileRoute } from '@tanstack/react-router'

import { getAdminUsers } from '../admin.functions'

export const Route = createFileRoute('/admin/users')({
  loader: () => getAdminUsers(),
  component: UsersResource,
})

function UsersResource() {
  const users = Route.useLoaderData()

  return (
    <section className="admin-resource" aria-labelledby="users-title">
      <header className="admin-resource__header">
        <div>
          <p>Identity / People</p>
          <h1 id="users-title">People and access.</h1>
        </div>
        <span>{users.length} records</span>
      </header>

      <p className="admin-resource__intro">
        Users, assigned roles, and the identity records available to this
        administrator. This first resource is intentionally read-only.
      </p>

      <div
        className="admin-table-wrap"
        role="region"
        aria-label="People and roles"
        tabIndex={0}
      >
        <table className="admin-table">
          <thead>
            <tr>
              <th scope="col">Person</th>
              <th scope="col">Email</th>
              <th scope="col">Roles</th>
              <th scope="col">Created</th>
            </tr>
          </thead>
          <tbody>
            {users.length ? (
              users.map((user) => (
                <tr key={user.id}>
                  <th scope="row">{user.name ?? 'Unnamed user'}</th>
                  <td>{user.email}</td>
                  <td>{user.roles.join(', ') || 'Unassigned'}</td>
                  <td>{user.createdAt}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={4}>No identity records yet.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  )
}
