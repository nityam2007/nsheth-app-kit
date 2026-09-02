import { createFileRoute } from '@tanstack/react-router'
import { useServerFn } from '@tanstack/react-start'
import { Button, Container, Field } from '@nsheth/ui'
import { useState } from 'react'

import {
  createDemoIdentitySession,
  getIdentityRbacProof,
} from '../identity.functions'

import type { Principal } from '@nsheth/identity'

export const Route = createFileRoute('/')({ component: Home })

function Home() {
  return (
    <>
      <a className="skip-link" href="#main-content">
        Skip to content
      </a>

      <header className="site-header">
        <Container className="site-header__inner" wide>
          <a className="wordmark" href="/" aria-label="NSheth UI home">
            NSheth
          </a>
          <span className="site-header__label">UI foundation / 01</span>
        </Container>
      </header>

      <main id="main-content">
        <section className="hero" aria-labelledby="page-title">
          <Container className="hero__layout" wide>
            <div className="hero__copy">
              <p className="mono-label">NSheth UI / Foundation 01</p>
              <h1 id="page-title">A system for useful interfaces.</h1>
              <p className="hero__lead">
                Shared UI, identity, and authorization foundations for the
                templates we build next.
              </p>
              <div className="hero__actions">
                <a className="ns-button ns-button--primary" href="#controls">
                  Inspect controls
                </a>
                <a className="text-link" href="#foundations">
                  Read principles
                </a>
              </div>
            </div>

            <div className="hero__mark" aria-hidden="true">
              <span className="hero__orbit" />
              <span className="hero__axis" />
              <span className="hero__caption">Clear / capable / alive</span>
            </div>
          </Container>
        </section>

        <section
          className="showcase-section"
          id="foundations"
          aria-labelledby="foundations-title"
        >
          <Container wide>
            <header className="section-heading">
              <h2 id="foundations-title">Graphite. Ink. One signal.</h2>
              <p>
                The foundation stays quiet so hierarchy, content, and action
                remain obvious.
              </p>
            </header>

            <ul className="palette" aria-label="Core color tokens">
              <li className="palette__item palette__item--canvas">
                <strong>Canvas</strong>
                <code>#0B0D0C</code>
              </li>
              <li className="palette__item palette__item--surface">
                <strong>Surface</strong>
                <code>#202421</code>
              </li>
              <li className="palette__item palette__item--ink">
                <strong>Ink</strong>
                <code>#F2F3EF</code>
              </li>
              <li className="palette__item palette__item--signal">
                <strong>Signal</strong>
                <code>#FF3D81</code>
              </li>
            </ul>

            <div className="type-specimen">
              <p className="type-specimen__meta">Display / 700 / 0.98</p>
              <p className="type-specimen__display">Make it useful.</p>
              <p className="type-specimen__body">
                Neue Montreal carries the interface. IBM Plex Mono marks system
                details and useful metadata.
              </p>
            </div>
          </Container>
        </section>

        <section
          className="showcase-section"
          id="controls"
          aria-labelledby="controls-title"
        >
          <Container className="controls-layout" wide>
            <header className="section-heading controls-layout__heading">
              <h2 id="controls-title">Controls that explain themselves.</h2>
              <p>
                Visible labels, native behavior, clear states, and enough room
                to use them comfortably.
              </p>
            </header>

            <div className="control-specimen">
              <form className="example-form" action="#controls">
                <Field
                  autoComplete="name"
                  hint="Use the person’s real name when it helps the task."
                  label="Name"
                  name="name"
                  placeholder="Your name"
                />
                <Field
                  autoComplete="email"
                  defaultValue="name@"
                  error="Enter a complete email address."
                  label="Email"
                  name="email"
                  required
                  type="email"
                />
                <div className="control-specimen__actions">
                  <Button type="submit">Check fields</Button>
                  <Button popoverTarget="state-note" variant="secondary">
                    State notes
                  </Button>
                </div>
              </form>

              <div
                className="foundation-popover"
                id="state-note"
                popover="auto"
              >
                <strong>Native first.</strong>
                <p>
                  Buttons keep keyboard behavior; fields connect labels,
                  descriptions, and errors.
                </p>
              </div>
            </div>
          </Container>
        </section>

        <IdentityProof />
      </main>

      <footer className="site-footer">
        <Container className="site-footer__inner" wide>
          <span>NSheth App Kit</span>
          <span>Made for real use.</span>
        </Container>
      </footer>
    </>
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
    <section className="showcase-section" aria-labelledby="identity-title">
      <Container className="identity-layout" wide>
        <header className="section-heading identity-layout__heading">
          <p className="mono-label">Identity / Foundation 02</p>
          <h2 id="identity-title">Permission checked at the boundary.</h2>
          <p>
            A development-only session proves both the admin role and the
            identity.read permission inside a protected server function.
          </p>
        </header>

        <div className="identity-proof" aria-live="polite">
          <p className="identity-proof__eyebrow">Server-enforced RBAC</p>
          {principal ? (
            <dl className="identity-proof__result">
              <div>
                <dt>User</dt>
                <dd>{principal.email}</dd>
              </div>
              <div>
                <dt>Role</dt>
                <dd>{principal.roles.join(', ')}</dd>
              </div>
              <div>
                <dt>Permission</dt>
                <dd>{principal.permissions.join(', ')}</dd>
              </div>
              <div>
                <dt>Decision</dt>
                <dd className="identity-proof__allowed">Allowed</dd>
              </div>
            </dl>
          ) : (
            <p className="identity-proof__empty">
              No session yet. Run the check to create the local demo identity.
            </p>
          )}
          <Button disabled={pending} onClick={runProof}>
            {pending ? 'Checking...' : 'Run identity check'}
          </Button>
          {error ? <p className="identity-proof__error">{error}</p> : null}
        </div>
      </Container>
    </section>
  )
}
