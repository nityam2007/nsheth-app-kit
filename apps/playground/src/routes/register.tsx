import { useState } from 'react'
import { createFileRoute, Link } from '@tanstack/react-router'
import { useServerFn } from '@tanstack/react-start'
import { AuthLayout, DevelopmentEmail } from '../components/auth-layout'
import { ActionForm } from '../components/workflow'
import { Input } from '../components/base/input/input'
import { registerAccount } from '../auth.functions'

export const Route = createFileRoute('/register')({ component: Register })
function Register() {
  const register = useServerFn(registerAccount)
  const [link, setLink] = useState<string>()
  const [sent, setSent] = useState(false)
  return (
    <AuthLayout
      title="Create your account"
      description="Start with your email. Verify it to choose a password and see your activity."
    >
      {sent ? (
        <div
          role="status"
          className="rounded-lg bg-secondary p-5 text-secondary"
        >
          <h2 className="font-semibold">Check your inbox</h2>
          <p className="mt-2">
            If this email can be registered, a verification link is on its way.
            Already registered? Sign in or reset your password.
          </p>
        </div>
      ) : (
        <ActionForm
          label="Send verification email"
          success="Check your inbox."
          action={async (f) => {
            const result = await register({
              data: {
                name: String(f.get('name')),
                email: String(f.get('email')),
              },
            })
            setLink(result.developmentLink)
            setSent(true)
          }}
        >
          <Input
            label="Full name"
            name="name"
            autoComplete="name"
            isRequired
            maxLength={100}
          />
          <Input
            label="Email address"
            name="email"
            type="email"
            autoComplete="email"
            isRequired
            maxLength={254}
          />
          <p className="text-sm text-tertiary">
            We use your email to connect your orders and requests.{' '}
            <Link to="/privacy" className="underline">
              Privacy notice
            </Link>
          </p>
        </ActionForm>
      )}
      <DevelopmentEmail href={link} />
      <Link
        to="/login"
        className="mt-6 inline-flex min-h-11 items-center text-sm font-semibold text-brand-secondary"
      >
        Already have an account? Sign in →
      </Link>
    </AuthLayout>
  )
}
