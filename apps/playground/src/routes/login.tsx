import { createFileRoute, Link } from '@tanstack/react-router'
import { useServerFn } from '@tanstack/react-start'
import { Container } from '../components/container'
import { ActionForm, PageHeading } from '../components/workflow'
import { createDemoIdentitySession } from '../identity.functions'

export const Route = createFileRoute('/login')({ component: Login })
function Login() {
  const demo = useServerFn(createDemoIdentitySession)
  return (
    <Container className="max-w-xl py-20">
      <Link className="text-brand-secondary" to="/">
        ← Home
      </Link>
      <div className="mt-8">
        <PageHeading
          eyebrow="Your workspace"
          title="Sign in"
          description="Use your verified GitHub account to view your activity or access your team’s workspace."
        />
      </div>
      <a
        className="flex min-h-12 items-center justify-center rounded-lg bg-brand-solid px-5 py-3 font-semibold text-white"
        href="/auth/github"
      >
        Continue with GitHub
      </a>
      {import.meta.env.DEV && (
        <div className="mt-10 border-t border-secondary pt-6">
          <p className="mb-5 text-sm text-tertiary">
            Local development access. Unavailable in production.
          </p>
          <ActionForm
            label="Use development admin"
            action={async () => {
              await demo()
              return '/admin'
            }}
          >
            {null}
          </ActionForm>
        </div>
      )}
    </Container>
  )
}
