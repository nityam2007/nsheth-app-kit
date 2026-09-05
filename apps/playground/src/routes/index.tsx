import {
  ArrowRight,
  File06,
  LayersThree01,
  ShieldTick,
} from '@untitledui/icons'
import { Link, createFileRoute } from '@tanstack/react-router'
import { useServerFn } from '@tanstack/react-start'
import { useState } from 'react'

import { Button } from '@/components/base/buttons/button'
import { Input } from '@/components/base/input/input'
import { Container } from '@/components/container'

import {
  createDemoIdentitySession,
  getIdentityRbacProof,
} from '../identity.functions'

import type { Principal } from '@nsheth/identity'

export const Route = createFileRoute('/')({ component: Home })

const capabilities = [
  {
    icon: LayersThree01,
    title: 'Composable foundations',
    description:
      'Start with routing, data, identity, admin, and content boundaries that already work together.',
  },
  {
    icon: ShieldTick,
    title: 'Server-enforced access',
    description:
      'Keep sessions, roles, permissions, and private data checks at the server boundary.',
  },
  {
    icon: File06,
    title: 'Working vertical slices',
    description:
      'Build from real product flows instead of maintaining speculative framework layers.',
  },
]

function Home() {
  return (
    <div className="min-h-svh bg-primary">
      <a
        className="fixed top-3 left-3 z-50 -translate-y-24 rounded-lg bg-brand-solid px-4 py-2.5 text-sm font-semibold text-white shadow-xs focus:translate-y-0 focus:outline-2 focus:outline-offset-2 focus:outline-brand"
        href="#main-content"
      >
        Skip to content
      </a>

      <header className="border-b border-secondary bg-primary">
        <Container className="flex min-h-18 items-center justify-between gap-6">
          <Link
            className="text-lg font-semibold text-primary no-underline outline-brand focus-visible:outline-2 focus-visible:outline-offset-4"
            to="/"
          >
            NSheth App Kit
          </Link>
          <nav
            className="flex items-center gap-5"
            aria-label="Primary navigation"
          >
            <Link
              className="text-sm font-semibold text-tertiary"
              to="/services"
            >
              Services
            </Link>
            <a
              className="text-sm font-semibold text-tertiary hover:text-tertiary_hover"
              href="#capabilities"
            >
              Foundations
            </a>
            <Link
              className="text-sm font-semibold text-tertiary hover:text-tertiary_hover"
              to="/catalogue"
            >
              Catalogue
            </Link>
            <Link
              className="text-sm font-semibold text-tertiary hover:text-tertiary_hover"
              to="/blog"
            >
              Notes
            </Link>
          </nav>
        </Container>
      </header>

      <main id="main-content">
        <section
          className="py-20 sm:py-24 lg:py-32"
          aria-labelledby="page-title"
        >
          <Container className="grid items-center gap-16 lg:grid-cols-[minmax(0,1fr)_28rem]">
            <div>
              <p className="mb-4 text-sm font-semibold text-brand-secondary">
                TanStack Start application foundation
              </p>
              <h1
                className="max-w-4xl text-display-lg font-semibold tracking-tight text-primary sm:text-display-xl"
                id="page-title"
              >
                Build the product, not the plumbing.
              </h1>
              <p className="mt-6 max-w-2xl text-lg text-tertiary sm:text-xl">
                A source-first kit for composing focused applications with
                working identity, admin, content, and data boundaries.
              </p>
              <div className="mt-8 flex flex-col-reverse gap-3 sm:flex-row">
                <Button
                  color="secondary"
                  size="lg"
                  onPress={() =>
                    document.querySelector('#controls')?.scrollIntoView()
                  }
                >
                  Inspect controls
                </Button>
                <Button
                  iconTrailing={ArrowRight}
                  size="lg"
                  onPress={() =>
                    document.querySelector('#identity')?.scrollIntoView()
                  }
                >
                  Run the proof
                </Button>
              </div>
            </div>

            <div className="rounded-2xl bg-secondary p-6 ring-1 ring-secondary sm:p-8">
              <div className="rounded-xl bg-primary p-5 shadow-xs ring-1 ring-secondary">
                <div className="flex items-center justify-between gap-4 border-b border-secondary pb-4">
                  <span className="text-sm font-semibold text-primary">
                    Current foundation
                  </span>
                  <span className="rounded-full bg-success-primary px-2.5 py-1 text-xs font-medium text-success-primary">
                    Working
                  </span>
                </div>
                <dl className="mt-2 divide-y divide-secondary">
                  {[
                    ['Runtime', 'TanStack Start'],
                    ['Persistence', 'PostgreSQL + Prisma'],
                    ['UI', 'Untitled UI React'],
                    ['Access', 'RBAC at server boundary'],
                  ].map(([term, value]) => (
                    <div
                      className="grid grid-cols-[7rem_minmax(0,1fr)] gap-4 py-3"
                      key={term}
                    >
                      <dt className="text-sm text-tertiary">{term}</dt>
                      <dd className="text-sm font-medium text-primary">
                        {value}
                      </dd>
                    </div>
                  ))}
                </dl>
              </div>
            </div>
          </Container>
        </section>

        <section
          className="border-y border-secondary bg-secondary py-16 sm:py-20"
          id="capabilities"
          aria-labelledby="capabilities-title"
        >
          <Container>
            <div className="max-w-2xl">
              <p className="text-sm font-semibold text-brand-secondary">
                Foundations
              </p>
              <h2
                className="mt-3 text-display-sm font-semibold text-primary sm:text-display-md"
                id="capabilities-title"
              >
                The essentials are connected.
              </h2>
              <p className="mt-4 text-lg text-tertiary">
                Each boundary exists because a working route uses it today.
              </p>
            </div>
            <ul className="mt-12 divide-y divide-secondary border-y border-secondary">
              {capabilities.map(({ description, icon: Icon, title }) => (
                <li
                  className="grid gap-5 py-7 sm:grid-cols-[3rem_14rem_minmax(0,1fr)] sm:items-center"
                  key={title}
                >
                  <span className="flex size-10 items-center justify-center rounded-lg bg-brand-primary text-brand-secondary ring-1 ring-brand">
                    <Icon aria-hidden="true" className="size-5" />
                  </span>
                  <strong className="text-md font-semibold text-primary">
                    {title}
                  </strong>
                  <span className="max-w-2xl text-md text-tertiary">
                    {description}
                  </span>
                </li>
              ))}
            </ul>
          </Container>
        </section>

        <section className="py-16 sm:py-24" id="controls">
          <Container className="grid gap-12 lg:grid-cols-[minmax(0,0.8fr)_minmax(24rem,1.2fr)] lg:gap-20">
            <div className="max-w-xl">
              <p className="text-sm font-semibold text-brand-secondary">
                Controls
              </p>
              <h2 className="mt-3 text-display-sm font-semibold text-primary sm:text-display-md">
                Accessible by default.
              </h2>
              <p className="mt-4 text-lg text-tertiary">
                Copied Untitled UI primitives provide labels, validation states,
                keyboard behavior, and consistent focus treatment.
              </p>
            </div>

            <form
              className="grid gap-5 rounded-xl bg-secondary p-6 ring-1 ring-secondary sm:p-8"
              action="#controls"
            >
              <Input
                autoComplete="name"
                hint="Use the person's real name when it helps the task."
                label="Name"
                name="name"
                placeholder="Your name"
              />
              <Input
                autoComplete="email"
                defaultValue="name@"
                hint="Enter a complete email address."
                isInvalid
                isRequired
                label="Email"
                name="email"
                type="email"
              />
              <Button className="mt-1 justify-self-start" type="submit">
                Check fields
              </Button>
            </form>
          </Container>
        </section>

        <IdentityProof />
      </main>

      <footer className="border-t border-secondary py-8">
        <Container className="flex flex-col gap-3 text-sm text-tertiary sm:flex-row sm:items-center sm:justify-between">
          <span>NSheth App Kit</span>
          <Link className="font-semibold text-secondary" to="/blog">
            Read implementation notes
          </Link>
        </Container>
      </footer>
    </div>
  )
}

function IdentityProof() {
  const createDemoSession = useServerFn(createDemoIdentitySession)
  const getProof = useServerFn(getIdentityRbacProof)
  const [principal, setPrincipal] = useState<Principal>()
  const [error, setError] = useState('')
  const [pending, setPending] = useState(false)

  async function runProof() {
    setPending(true)
    setError('')

    try {
      await createDemoSession()
      setPrincipal(await getProof())
    } catch {
      setError('The RBAC proof failed. Check DATABASE_URL and the schema.')
    } finally {
      setPending(false)
    }
  }

  return (
    <section
      className="border-t border-secondary bg-secondary py-16 sm:py-24"
      id="identity"
      aria-labelledby="identity-title"
    >
      <Container className="grid gap-12 lg:grid-cols-[minmax(0,0.8fr)_minmax(24rem,1.2fr)] lg:gap-20">
        <div className="max-w-xl">
          <p className="text-sm font-semibold text-brand-secondary">
            Identity and RBAC
          </p>
          <h2
            className="mt-3 text-display-sm font-semibold text-primary sm:text-display-md"
            id="identity-title"
          >
            Permission checked at the boundary.
          </h2>
          <p className="mt-4 text-lg text-tertiary">
            A development-only session proves the admin role and identity.read
            permission inside a protected server function.
          </p>
        </div>

        <div
          className="rounded-xl bg-primary p-6 shadow-xs ring-1 ring-secondary sm:p-8"
          aria-live="polite"
        >
          {principal ? (
            <dl className="divide-y divide-secondary">
              {[
                ['User', principal.email],
                ['Role', principal.roles.join(', ')],
                ['Permission', principal.permissions.join(', ')],
                ['Decision', 'Allowed'],
              ].map(([term, value]) => (
                <div
                  className="grid grid-cols-[7rem_minmax(0,1fr)] gap-4 py-3 first:pt-0"
                  key={term}
                >
                  <dt className="text-sm text-tertiary">{term}</dt>
                  <dd
                    className={
                      term === 'Decision'
                        ? 'text-sm font-medium text-success-primary'
                        : 'text-sm font-medium text-primary'
                    }
                  >
                    {value}
                  </dd>
                </div>
              ))}
            </dl>
          ) : (
            <p className="mt-0 text-md text-tertiary">
              No session yet. Run the check to create the local demo identity.
            </p>
          )}
          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <Button
              isDisabled={pending}
              isLoading={pending}
              showTextWhileLoading
              onPress={runProof}
            >
              Run identity check
            </Button>
            {principal ? (
              <Link
                className="inline-flex min-h-10 items-center justify-center rounded-lg bg-primary px-3.5 py-2.5 text-sm font-semibold text-secondary shadow-xs-skeuomorphic ring-1 ring-primary ring-inset hover:bg-primary_hover"
                to="/admin/users"
              >
                Open admin
              </Link>
            ) : null}
          </div>
          {error ? (
            <p className="mt-4 text-sm text-error-primary" role="alert">
              {error}
            </p>
          ) : null}
        </div>
      </Container>
    </section>
  )
}
