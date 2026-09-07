import { createFileRoute, notFound } from '@tanstack/react-router'
import { getAdminUsers } from '../admin.functions'
import { Route as Admin } from './admin'
import {
  ObjectCollection,
  WorkspaceHeading,
  SectionPanel,
  RecordTrail,
  StatusBadge,
} from '../components/admin/workspace'

export const Route = createFileRoute('/admin/users')({
  loader: () => getAdminUsers(),
  validateSearch: (search: Record<string, unknown>): { record?: string } => ({
    record: typeof search.record === 'string' ? search.record : undefined,
  }),
  component: People,
})
function People() {
  const users = Route.useLoaderData(),
    { record } = Route.useSearch(),
    { principal } = Admin.useRouteContext()
  if (!record)
    return (
      <ObjectCollection
        eyebrow="People"
        title="People"
        description="The people behind your workspace. Open a profile to review their identity and access."
        empty="Accounts appear here after registration or sign-in."
        objects={users.map((u) => ({
          id: u.id,
          title: u.name ?? u.email,
          subtitle: u.email,
          status: u.disabledAt
            ? 'DISABLED'
            : u.emailVerifiedAt
              ? 'VERIFIED'
              : 'UNVERIFIED',
          href: '/admin/users?record=' + u.id,
          meta: [
            { label: 'Role', value: u.roles.join(', ') || 'Unassigned' },
            { label: 'Joined', value: u.createdAt },
          ],
        }))}
      />
    )
  const user = users.find((u) => u.id === record)
  if (!user) throw notFound()
  return (
    <>
      <RecordTrail href="/admin/users" label="People" />
      <WorkspaceHeading
        eyebrow="People"
        title={user.name ?? user.email}
        description={user.email}
        action={
          principal.permissions.includes('identity.write') ? (
            <a
              className="admin-primary-link"
              href={'/admin/access?record=' + user.id}
            >
              Manage access
            </a>
          ) : undefined
        }
      />
      <div className="grid gap-6 lg:grid-cols-2">
        <SectionPanel title="Identity">
          <dl className="grid gap-5 text-sm">
            <div>
              <dt className="text-tertiary">Email</dt>
              <dd className="mt-1 break-all font-medium text-primary">
                {user.email}
              </dd>
            </div>
            <div>
              <dt className="mb-2 text-tertiary">Account status</dt>
              <dd>
                <StatusBadge
                  value={
                    user.disabledAt
                      ? 'DISABLED'
                      : user.emailVerifiedAt
                        ? 'VERIFIED'
                        : 'UNVERIFIED'
                  }
                />
              </dd>
            </div>
            <div>
              <dt className="text-tertiary">Joined</dt>
              <dd className="mt-1 text-secondary">{user.createdAt}</dd>
            </div>
          </dl>
        </SectionPanel>
        <SectionPanel
          title="Workspace access"
          description="Permissions are enforced by the server on every request."
        >
          <ul className="flex flex-wrap gap-2">
            {user.roles.map((role) => (
              <li
                className="rounded-lg bg-secondary px-3 py-2 text-sm font-medium text-secondary"
                key={role}
              >
                {role}
              </li>
            ))}
          </ul>
          <p className="mt-5 break-all text-xs text-tertiary">
            Identity reference {user.id}
          </p>
        </SectionPanel>
      </div>
    </>
  )
}
