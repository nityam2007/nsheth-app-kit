import { appConfig } from '../app.config'
import type { ReactNode } from 'react'
import { Link } from '@tanstack/react-router'
import { Container } from './container'

export function AuthLayout({
  title,
  description,
  children,
}: {
  title: string
  description: string
  children: ReactNode
}) {
  return (
    <main className="min-h-svh bg-secondary">
      <Container className="grid min-h-svh items-center gap-12 py-12 lg:grid-cols-[1fr_1fr]">
        <aside className="hidden max-w-lg lg:block">
          <Link to="/" className="text-lg font-semibold text-brand-secondary">
            {appConfig.name}
          </Link>
          <h2 className="mt-14 text-display-md font-semibold tracking-tight text-primary">
            One account.
            <br />
            Everything in reach.
          </h2>
          <p className="mt-6 text-lg leading-relaxed text-tertiary">
            Keep your orders, appointments, stays, and conversations together.
            Pick up where you left off.
          </p>
          <div className="mt-10 border-t border-secondary pt-6 text-sm text-tertiary">
            Your activity stays private. Your workspace follows your role.
          </div>
        </aside>
        <section className="mx-auto w-full max-w-lg rounded-2xl bg-primary p-6 shadow-xs ring-1 ring-secondary sm:p-10">
          <Link
            to="/"
            className="inline-flex min-h-11 items-center text-sm font-semibold text-brand-secondary"
          >
            ← Return home
          </Link>
          <header className="mb-8 mt-5">
            <h1 className="text-display-sm font-semibold text-primary">
              {title}
            </h1>
            <p className="mt-3 text-md text-tertiary">{description}</p>
          </header>
          {children}
        </section>
      </Container>
    </main>
  )
}
export function DevelopmentEmail({ href }: { href?: string }) {
  return href ? (
    <aside className="mt-6 rounded-lg border border-brand bg-brand-primary p-4">
      <p className="text-sm text-secondary">Development email preview</p>
      <a
        className="mt-2 inline-flex min-h-11 items-center font-semibold text-brand-secondary underline"
        href={href}
      >
        Open verification email →
      </a>
    </aside>
  ) : null
}
