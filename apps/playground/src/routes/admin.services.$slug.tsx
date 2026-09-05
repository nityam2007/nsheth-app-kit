import { createFileRoute, Outlet, notFound } from '@tanstack/react-router'
import { getAdminService } from '../booking.functions'

export const Route = createFileRoute('/admin/services/$slug')({
  loader: async ({ params }) => {
    const service = await getAdminService({ data: params })
    if (!service) throw notFound()
    return service
  },
  component: Outlet,
})
