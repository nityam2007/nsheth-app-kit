import { PublicError } from '../errors'
import { useState } from 'react'
import { Link } from '@tanstack/react-router'
import { useServerFn } from '@tanstack/react-start'
import { AuthLayout, DevelopmentEmail } from './auth-layout'
import { ActionForm } from './workflow'
import { Input } from './base/input/input'
import {
  completeAccountChallenge,
  requestAccountEmail,
} from '../auth.functions'

export function AccountChallenge({
  kind,
  token,
}: {
  kind: 'VERIFY' | 'RESET'
  token?: string
}) {
  const request = useServerFn(requestAccountEmail),
    complete = useServerFn(completeAccountChallenge)
  const [link, setLink] = useState<string>()
  const [done, setDone] = useState(false)
  const title = kind === 'VERIFY' ? 'Verify your email' : 'Reset your password'
  return (
    <AuthLayout
      title={done ? 'You’re all set' : title}
      description={
        done
          ? 'Your password is saved. Sign in to continue.'
          : token
            ? 'Choose a password with at least 12 characters. This link expires after 30 minutes.'
            : 'Enter your email to receive a secure link.'
      }
    >
      {!done && (
        <ActionForm
          key={token ?? 'request'}
          label={token ? 'Save password' : 'Send email'}
          success={
            token
              ? 'Password saved.'
              : 'If this account is eligible, an email is on its way.'
          }
          action={async (f) => {
            if (token) {
              const password = String(f.get('password'))
              if (password !== f.get('confirm'))
                throw new PublicError('Passwords do not match.', 400)
              await complete({ data: { token, kind, password } })
              setDone(true)
            } else {
              const result = await request({
                data: { email: String(f.get('email')), kind },
              })
              setLink(result.developmentLink)
            }
          }}
        >
          {token ? (
            <>
              <Input
                label="New password"
                name="password"
                type="password"
                autoComplete="new-password"
                minLength={12}
                maxLength={128}
                isRequired
              />
              <Input
                label="Confirm password"
                name="confirm"
                type="password"
                autoComplete="new-password"
                minLength={12}
                maxLength={128}
                isRequired
              />
            </>
          ) : (
            <Input
              label="Email address"
              name="email"
              type="email"
              autoComplete="email"
              isRequired
            />
          )}
        </ActionForm>
      )}
      <DevelopmentEmail href={link} />
      <Link
        to="/login"
        className="mt-6 inline-flex min-h-11 items-center font-semibold text-brand-secondary"
      >
        Return to sign in →
      </Link>
    </AuthLayout>
  )
}
