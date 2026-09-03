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

export const adminModules = [contentPostsModule, identityUsersModule] as const
