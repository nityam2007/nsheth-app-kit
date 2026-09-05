import { createFileRoute } from '@tanstack/react-router'
import { Route as AdminRoute } from './admin'
import { PageHeading } from '../components/workflow'

export const Route = createFileRoute('/admin/')({
  component: Dashboard,
})

function Dashboard() {
  const { modules, principal } = AdminRoute.useRouteContext()
  return (
    <section>
      <PageHeading
        eyebrow="Workspace"
        title="Welcome back"
        description={`Signed in as ${principal.email}. Choose a module to get started.`}
      />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {modules.map((m) => (
          <a
            key={m.id}
            href={m.href}
            className="rounded-xl border border-secondary bg-primary p-6 hover:bg-primary_hover"
          >
            <span className="text-xs font-semibold text-tertiary">
              {m.group}
            </span>
            <h2 className="mt-2 text-lg font-semibold text-primary">
              {m.label} →
            </h2>
          </a>
        ))}
      </div>
      <p className="mt-8 text-sm text-tertiary">
        Shortcut: Ctrl/Cmd + Shift + H returns to this workspace.{' '}
        <a href="/account" className="text-brand-secondary">
          Account & sign out
        </a>
      </p>
    </section>
  )
}
