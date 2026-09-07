import { createFileRoute } from '@tanstack/react-router'
import { useServerFn } from '@tanstack/react-start'
import { getAccountProfile, updateAccountProfile } from '../account.functions'
import { WorkspaceHeading, SectionPanel } from '../components/admin/workspace'
import { ActionForm } from '../components/workflow'
import { Input } from '../components/base/input/input'

export const Route = createFileRoute('/account/profile')({
  loader: () => getAccountProfile(),
  component: Profile,
})
function Profile() {
  const profile = Route.useLoaderData(),
    save = useServerFn(updateAccountProfile)
  return (
    <>
      <WorkspaceHeading
        eyebrow="Your account"
        title="Profile"
        description="Keep your details up to date."
      />
      <SectionPanel title="Personal details">
        <ActionForm
          label="Save profile"
          guard
          action={(f) => save({ data: { name: String(f.get('name')) } })}
        >
          <Input
            name="name"
            label="Full name"
            autoComplete="name"
            defaultValue={profile.name ?? ''}
            maxLength={100}
            isRequired
          />
          <Input
            label="Verified email"
            value={profile.email}
            isReadOnly
            hint="Contact the team to change your email. It connects your existing activity."
          />
        </ActionForm>
      </SectionPanel>
      <p className="mt-6 text-sm text-tertiary">
        Member since {profile.createdAt.toISOString().slice(0, 10)} ·{' '}
        {profile.githubId ? 'GitHub connected' : 'Email account'}
      </p>
    </>
  )
}
