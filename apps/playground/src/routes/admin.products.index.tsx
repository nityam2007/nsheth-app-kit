import { hasPermission } from '@nsheth/identity'
import { adminWorkflows, collectionSearch } from '../admin-workflows'
import { createFileRoute } from '@tanstack/react-router'
import { getAdminProducts } from '../product.functions'
import { ObjectCollection } from '../components/admin/workspace'

export const Route = createFileRoute('/admin/products/')({
  validateSearch: collectionSearch,
  loader: () => getAdminProducts(),
  component: Collection,
})
function Collection() {
  const records = Route.useLoaderData()
  return (
    <ObjectCollection
      key={Route.useSearch().status}
      initialStatus={Route.useSearch().status}
      guidance={adminWorkflows['/admin/products']?.steps}
      title="Products"
      eyebrow="Sell"
      description="Product families, options, publication and inventory."
      createHref={
        hasPermission(Route.useRouteContext().principal, 'product.write')
          ? '/admin/products/new'
          : undefined
      }
      createLabel="New product"
      objects={records.map((p) => ({
        id: p.id,
        title: p.name,
        subtitle: p.summary,
        image: p.imageUrl,
        status: p.archivedAt ? 'RETIRED' : p.status,
        href: '/admin/products/' + p.slug,
        meta: [
          { label: 'Stock', value: String(p.stock) },
          { label: 'SKU', value: p.sku || 'Not assigned' },
          { label: 'Type', value: p.parentId ? 'Option' : 'Product' },
          { label: 'Updated', value: p.updatedAt },
        ],
      }))}
    />
  )
}
