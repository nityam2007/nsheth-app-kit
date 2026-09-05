import { createFileRoute, Link } from '@tanstack/react-router'
import { useServerFn } from '@tanstack/react-start'
import { useState } from 'react'
import { submitPrivacyRequest } from '../operations.functions'
import { Container } from '../components/container'
import { ActionForm, PageHeading } from '../components/workflow'
import { Input } from '../components/base/input/input'
import { TextArea } from '../components/base/textarea/textarea'

export const Route = createFileRoute('/privacy')({ component: Privacy })
function Privacy() {
  const submit = useServerFn(submitPrivacyRequest)
  const [reference, setReference] = useState('')
  return (
    <Container className="max-w-3xl py-16">
      <Link className="text-brand-secondary" to="/">
        ← Home
      </Link>
      <div className="mt-8">
        <PageHeading
          eyebrow="Your information"
          title="Privacy & contact"
          description="Contact the operator about access, corrections, deletion, or another privacy concern."
        />
      </div>
      <div className="mb-10 space-y-5 leading-7 text-tertiary">
        <p>
          This starter stores the contact details you provide with enquiries,
          appointments, reservations, and orders. Sign-in uses a verified GitHub
          email and a necessary HTTP-only session cookie lasting up to eight
          hours. Shopping cart items are stored in your browser; contact details
          are not stored in the cart.
        </p>
        <p>
          The operator must publish its identity, contact details, purposes,
          lawful bases, recipients, transfer arrangements, and retention periods
          before accepting real personal data. This starter notice is not a
          deployment-specific privacy policy.
        </p>
        <p>
          You can download your account activity after signing in. Requests
          below are reviewed by the operator, who may need to verify your
          identity and assess record-retention obligations before acting.
        </p>
      </div>
      {reference ? (
        <p role="status" className="break-all text-brand-secondary">
          Request received. Keep reference {reference}.
        </p>
      ) : (
        <ActionForm
          label="Submit privacy request"
          action={async (f) => {
            const result = await submit({
              data: {
                name: String(f.get('name')),
                email: String(f.get('email')),
                request: String(f.get('request')),
              },
            })
            setReference(result.reference)
          }}
        >
          <Input
            label="Name"
            name="name"
            isRequired
            minLength={2}
            maxLength={120}
          />
          <Input
            label="Email"
            name="email"
            type="email"
            isRequired
            maxLength={254}
          />
          <TextArea
            label="Your request"
            name="request"
            isRequired
            minLength={10}
            maxLength={2000}
            rows={6}
          />
        </ActionForm>
      )}
    </Container>
  )
}
