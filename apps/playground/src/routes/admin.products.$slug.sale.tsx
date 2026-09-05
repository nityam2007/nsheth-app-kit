import { createFileRoute } from '@tanstack/react-router'
import { useServerFn } from '@tanstack/react-start'
import { getProductSale, saveProductSale } from '../commerce.functions'
import { ActionForm, PageHeading, SelectField } from '../components/workflow'
import { Input } from '../components/base/input/input'

export const Route = createFileRoute('/admin/products/$slug/sale')({
  loader: ({ params }) => getProductSale({ data: params }),
  component: Sale,
})
function Sale() {
  const p = Route.useLoaderData(),
    save = useServerFn(saveProductSale)
  return (
    <section className="max-w-3xl">
      <PageHeading
        eyebrow="Commerce"
        title="Price & inventory"
        description="Only published products marked for sale appear in the shop. Stock is the remaining sellable quantity."
      />
      <ActionForm
        guard
        label="Save commerce settings"
        action={(f) =>
          save({
            data: {
              productId: p.id,
              price: Math.round(Number(f.get('price')) * 100),
              stock: Number(f.get('stock')),
              forSale: f.get('forSale') === 'true',
              category: String(f.get('category')),
              imageUrl: String(f.get('imageUrl')),
            },
          })
        }
      >
        <Input
          name="price"
          label="Price (INR)"
          type="number"
          min={0}
          max={100000}
          step="0.01"
          defaultValue={String(p.price / 100)}
          isRequired
        />
        <Input
          name="stock"
          label="Available stock"
          type="number"
          min={0}
          max={1000000}
          defaultValue={String(p.stock)}
          isRequired
        />
        <Input
          name="category"
          label="Collection"
          maxLength={100}
          defaultValue={p.category}
        />
        <Input
          name="imageUrl"
          label="Product image URL (HTTPS)"
          type="url"
          defaultValue={p.imageUrl}
          maxLength={2000}
        />
        <SelectField
          name="forSale"
          label="Shop visibility"
          defaultValue={String(p.forSale)}
        >
          <option value="false">Catalogue only</option>
          <option value="true">Available in shop</option>
        </SelectField>
      </ActionForm>
    </section>
  )
}
