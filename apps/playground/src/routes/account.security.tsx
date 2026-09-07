import { createFileRoute, Link } from '@tanstack/react-router'
import { useServerFn } from '@tanstack/react-start'
import { getOwnSessions, revokeOwnSession } from '../account.functions'
import { Route as Account } from './account'
import {
  WorkspaceHeading,
  SectionPanel,
  StatusBadge,
} from '../components/admin/workspace'
import { ActionForm } from '../components/workflow'
import { Button } from '../components/base/buttons/button'

export const Route = createFileRoute('/account/security')({
  loader: () => getOwnSessions(),
  component: Security,
})
function Security() {
  const sessions = Route.useLoaderData(),
    data = Account.useLoaderData(),
    revoke = useServerFn(revokeOwnSession)
  return (
    <>
      <WorkspaceHeading
        eyebrow="Your account"
        title="Security & data"
        description="Review your sessions and manage your personal information."
      />
      <div className="grid gap-6">
        <SectionPanel
          title="Password"
          description="Resetting your password signs out every existing session."
        >
          <Link to="/forgot-password" className="admin-secondary-link">
            Reset password
          </Link>
        </SectionPanel>
        <SectionPanel title="Active sessions">
          <ul className="divide-y divide-secondary">
            {sessions.map((s) => (
              <li
                className="flex flex-wrap items-center justify-between gap-4 py-4 first:pt-0"
                key={s.id}
              >
                <div>
                  <h3 className="font-semibold text-primary">
                    {s.current ? 'This session' : 'Another session'}
                  </h3>
                  <p className="mt-2 text-sm text-tertiary">
                    Started{' '}
                    {s.createdAt.toISOString().slice(0, 16).replace('T', ' ')}{' '}
                    UTC
                  </p>
                  <p className="mt-1 text-xs text-tertiary">
                    Expires{' '}
                    {s.expiresAt.toISOString().slice(0, 16).replace('T', ' ')}{' '}
                    UTC
                  </p>
                </div>
                {s.current ? (
                  <StatusBadge value="ACTIVE" />
                ) : (
                  <ActionForm
                    label="Revoke session"
                    action={() => revoke({ data: { id: s.id } })}
                  >
                    {null}
                  </ActionForm>
                )}
              </li>
            ))}
          </ul>
        </SectionPanel>
        <SectionPanel
          title="Your personal data"
          description="Download your account activity or request help with a correction or deletion."
        >
          <div className="flex flex-wrap gap-4">
            <Button
              color="secondary"
              onPress={() => {
                const url = URL.createObjectURL(
                  new Blob([JSON.stringify(data, null, 2)], {
                    type: 'application/json',
                  }),
                )
                const a = document.createElement('a')
                a.href = url
                a.download = 'my-account-data.json'
                a.click()
                setTimeout(() => URL.revokeObjectURL(url), 1000)
              }}
            >
              Download my data
            </Button>
            <Link to="/privacy" className="admin-secondary-link">
              Privacy requests
            </Link>
          </div>
        </SectionPanel>
      </div>
    </>
  )
}
