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
  productCatalogueModule,
  contentPostsModule,
  identityUsersModule,
] as const
