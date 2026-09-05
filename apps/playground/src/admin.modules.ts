import type { AdminModule } from '@nsheth/admin'

export const identityUsersModule = {
  id: 'identity-users',
  group: 'Identity',
  label: 'People',
  href: '/admin/users',
  permission: 'identity.read',
} as const satisfies AdminModule

export const contentPostsModule = {
  id: 'content-posts',
  group: 'Content',
  label: 'Posts',
  href: '/admin/posts',
  permission: 'content.read',
} as const satisfies AdminModule

export const productCatalogueModule = {
  id: 'product-catalogue',
  group: 'Catalogue',
  label: 'Products',
  href: '/admin/products',
  permission: 'product.read',
} as const satisfies AdminModule

export const adminModules = [
  {
    id: 'operations-enquiries',
    group: 'Operations',
    label: 'Enquiries',
    href: '/admin/enquiries',
    permission: 'operations.read',
  },
  {
    id: 'operations-privacy',
    group: 'Operations',
    label: 'Privacy requests',
    href: '/admin/privacy',
    permission: 'operations.read',
  },
  {
    id: 'identity-access',
    group: 'Identity',
    label: 'Team access',
    href: '/admin/access',
    permission: 'identity.write',
  },
  {
    id: 'commerce-orders',
    group: 'Commerce',
    label: 'Orders',
    href: '/admin/orders',
    permission: 'commerce.read',
  },
  {
    id: 'hospitality-properties',
    group: 'Hospitality',
    label: 'Properties',
    href: '/admin/properties',
    permission: 'hospitality.read',
  },
  {
    id: 'hospitality-reservations',
    group: 'Hospitality',
    label: 'Reservations',
    href: '/admin/reservations',
    permission: 'hospitality.read',
  },
  {
    id: 'booking-services',
    group: 'Booking',
    label: 'Services',
    href: '/admin/services',
    permission: 'booking.read',
  },
  {
    id: 'booking-requests',
    group: 'Booking',
    label: 'Requests',
    href: '/admin/bookings',
    permission: 'booking.read',
  },
  productCatalogueModule,
  contentPostsModule,
  identityUsersModule,
] as const
