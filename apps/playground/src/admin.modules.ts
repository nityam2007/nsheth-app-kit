import { moduleEnabled } from './app.config'
import type { AdminModule } from '@nsheth/admin'

export const identityUsersModule = {
  id: 'identity-users',
  group: 'People',
  label: 'People',
  href: '/admin/users',
  permission: 'identity.read',
} as const satisfies AdminModule

export const contentPostsModule = {
  id: 'content-posts',
  group: 'Publish',
  label: 'Posts',
  href: '/admin/posts',
  permission: 'content.read',
} as const satisfies AdminModule

export const productCatalogueModule = {
  id: 'product-catalogue',
  group: 'Sell',
  label: 'Products',
  href: '/admin/products',
  permission: 'product.read',
} as const satisfies AdminModule

const registeredModules = [
  {
    id: 'operations-enquiries',
    group: 'Inbox',
    label: 'Enquiries',
    href: '/admin/enquiries',
    permission: 'operations.read',
  },
  {
    id: 'operations-privacy',
    group: 'Inbox',
    label: 'Privacy requests',
    href: '/admin/privacy',
    permission: 'operations.read',
  },
  {
    id: 'identity-access',
    group: 'People',
    label: 'Team access',
    href: '/admin/access',
    permission: 'identity.write',
  },
  {
    id: 'commerce-orders',
    group: 'Sell',
    label: 'Orders',
    href: '/admin/orders',
    permission: 'commerce.read',
  },
  {
    id: 'hospitality-properties',
    group: 'Host',
    label: 'Properties',
    href: '/admin/properties',
    permission: 'hospitality.read',
  },
  {
    id: 'hospitality-reservations',
    group: 'Host',
    label: 'Reservations',
    href: '/admin/reservations',
    permission: 'hospitality.read',
  },
  {
    id: 'booking-services',
    group: 'Schedule',
    label: 'Services',
    href: '/admin/services',
    permission: 'booking.read',
  },
  {
    id: 'booking-requests',
    group: 'Schedule',
    label: 'Appointments',
    href: '/admin/bookings',
    permission: 'booking.read',
  },
  productCatalogueModule,
  contentPostsModule,
  identityUsersModule,
] as const

export const adminModules = registeredModules.filter((module) => {
  const domain = module.permission.split('.')[0]
  return domain === 'identity' || moduleEnabled(domain)
})
