import { createFileRoute, Outlet, notFound } from '@tanstack/react-router'
import { getAdminProperty } from '../hospitality.functions'

export const Route = createFileRoute('/admin/properties/$slug')({
  loader: async ({ params }) => {
    const property = await getAdminProperty({ data: params })
    if (!property) throw notFound()
    return property
  },
  component: Outlet,
})
