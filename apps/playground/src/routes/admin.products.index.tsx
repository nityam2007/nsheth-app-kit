import { createFileRoute } from '@tanstack/react-router'
import { getAdminProducts } from '../product.functions'
import { ObjectCollection } from '../components/admin/workspace'

export const Route = createFileRoute('/admin/products/')({
  loader: () => getAdminProducts(),
  component: Collection,
})
function Collection() {
  const records = Route.useLoaderData()
  return (
    <ObjectCollection
      title="Products"
      eyebrow="Sell"
      description="Product families, options, publication and inventory."
      createHref="/admin/products/new"
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
