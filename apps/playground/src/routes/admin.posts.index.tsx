import { hasPermission } from '@nsheth/identity'
import { adminWorkflows, collectionSearch } from '../admin-workflows'
import { createFileRoute } from '@tanstack/react-router'
import { getAdminPosts } from '../content.functions'
import { ObjectCollection } from '../components/admin/workspace'

export const Route = createFileRoute('/admin/posts/')({
  validateSearch: collectionSearch,
  loader: () => getAdminPosts(),
  component: Collection,
})
function Collection() {
  const records = Route.useLoaderData()
  return (
    <ObjectCollection
      key={Route.useSearch().status}
      initialStatus={Route.useSearch().status}
      guidance={adminWorkflows['/admin/posts']?.steps}
      title="Posts"
      eyebrow="Publish"
      description="Draft, review and publish articles with metadata and revision history."
      createHref={
        hasPermission(Route.useRouteContext().principal, 'content.write')
          ? '/admin/posts/new'
          : undefined
      }
      createLabel="Write post"
      objects={records.map((p) => ({
        id: p.id,
        title: p.title,
        subtitle: p.excerpt,
        image: p.coverUrl,
        status:
          p.status === 'PUBLISHED' &&
          p.publishedAt &&
          p.publishedAt > new Date().toISOString()
            ? 'SCHEDULED'
            : p.status,
        href: '/admin/posts/' + p.slug,
        meta: [
          { label: 'Author', value: p.author || 'Not assigned' },
          { label: 'Updated', value: p.updatedAt },
        ],
      }))}
    />
  )
}
