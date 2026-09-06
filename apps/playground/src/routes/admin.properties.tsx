import { requireRouteModule } from '../module-route'
import { createFileRoute, Outlet } from '@tanstack/react-router'

export const Route = createFileRoute('/admin/properties')({
  beforeLoad: () => requireRouteModule('hospitality'),
  component: Outlet,
})
