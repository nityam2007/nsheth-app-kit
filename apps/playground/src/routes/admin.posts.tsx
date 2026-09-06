import { requireRouteModule } from '../module-route'
import { Link, Outlet, createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/admin/posts')({
  beforeLoad: () => requireRouteModule('content'),
  component: Outlet,
  notFoundComponent: () => (
    <section className="py-12">
      <p className="text-sm font-semibold text-brand-secondary">404</p>
      <h1 className="mt-2 text-display-sm font-semibold text-primary">
        Post not found
      </h1>
      <Link
        className="mt-6 inline-flex text-sm font-semibold text-brand-secondary"
        to="/admin/posts"
      >
        Return to posts
      </Link>
    </section>
  ),
})
