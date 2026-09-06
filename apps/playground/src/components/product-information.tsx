export function ProductGallery({
  images,
  name,
}: {
  images: Array<{ url: string; alt: string }>
  name: string
}) {
  return images.length ? (
    <div className="grid grid-cols-2 gap-3">
      {images.map((image, index) => (
        <img
          key={image.url + index}
          src={image.url}
          alt={image.alt}
          referrerPolicy="no-referrer"
          loading={index ? 'lazy' : 'eager'}
          className={
            index === 0
              ? 'col-span-2 aspect-square w-full rounded-xl bg-secondary object-cover'
              : 'aspect-square w-full rounded-lg bg-secondary object-cover'
          }
        />
      ))}
    </div>
  ) : (
    <div
      aria-hidden="true"
      className="flex aspect-square items-center justify-center rounded-xl bg-secondary text-7xl text-quaternary"
    >
      {name[0]}
    </div>
  )
}
export function ProductSpecifications({
  brand,
  sku,
  unit,
  specifications,
}: {
  brand: string
  sku: string | null
  unit: string
  specifications: Array<{ label: string; value: string }>
}) {
  return (
    <dl className="mt-8 divide-y divide-secondary border-y border-secondary">
      {[
        ...(brand ? [{ label: 'Brand', value: brand }] : []),
        ...(sku ? [{ label: 'SKU', value: sku }] : []),
        { label: 'Unit', value: unit },
        ...specifications,
      ].map((item) => (
        <div key={item.label} className="grid grid-cols-2 gap-4 py-3">
          <dt className="text-sm text-tertiary">{item.label}</dt>
          <dd className="break-words text-sm font-medium text-primary">
            {item.value}
          </dd>
        </div>
      ))}
    </dl>
  )
}
