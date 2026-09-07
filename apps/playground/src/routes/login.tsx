import { createFileRoute, Link } from '@tanstack/react-router'
import { useServerFn } from '@tanstack/react-start'
import { AuthLayout } from '../components/auth-layout'
import { ActionForm } from '../components/workflow'
import { Input } from '../components/base/input/input'
import { createDemoIdentitySession } from '../identity.functions'
import { getSignInOptions, loginWithPassword } from '../auth.functions'

export const Route = createFileRoute('/login')({
  loader: () => getSignInOptions(),
  component: Login,
})
function Login() {
  const demo = useServerFn(createDemoIdentitySession),
    login = useServerFn(loginWithPassword)
  const { github } = Route.useLoaderData()
  return (
    <AuthLayout
      title="Welcome back"
      description="Sign in to your account and workspace."
    >
      <ActionForm
        label="Sign in"
        action={async (f) => {
          await login({
            data: {
              email: String(f.get('email')),
              password: String(f.get('password')),
            },
          })
          return '/account'
        }}
      >
        <Input
          name="email"
          label="Email address"
          type="email"
          autoComplete="email"
          isRequired
        />
        <Input
          name="password"
          label="Password"
          type="password"
          autoComplete="current-password"
          isRequired
          maxLength={128}
        />
      </ActionForm>
      <div className="mt-5 flex flex-wrap gap-x-6 gap-y-2 text-sm">
        <Link
          to="/forgot-password"
          className="inline-flex min-h-11 items-center text-brand-secondary"
        >
          Forgot password?
        </Link>
        <Link
          to="/register"
          className="inline-flex min-h-11 items-center font-semibold text-brand-secondary"
        >
          Create an account
        </Link>
        <Link
          to="/verify-email"
          className="inline-flex min-h-11 items-center text-brand-secondary"
        >
          Resend verification
        </Link>
      </div>
      {github && (
        <a className="admin-secondary-link mt-6 w-full" href="/auth/github">
          Continue with GitHub
        </a>
      )}
      {import.meta.env.DEV && (
        <details className="mt-8 border-t border-secondary pt-4">
          <summary className="flex min-h-11 cursor-pointer items-center text-sm font-semibold text-secondary">
            Development access
          </summary>
          <p className="mb-4 mt-3 text-sm text-tertiary">
            Local admin access. Unavailable in production.
            {!github ? ' GitHub sign-in is not configured.' : ''}
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
        </details>
      )}
    </AuthLayout>
  )
}
