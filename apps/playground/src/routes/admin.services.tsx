import { requireRouteModule } from '../module-route'
import { createFileRoute, Outlet } from '@tanstack/react-router'

export const Route = createFileRoute('/admin/services')({
  beforeLoad: () => requireRouteModule('booking'),
  component: Outlet,
})
