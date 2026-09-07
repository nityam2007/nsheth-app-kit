import { FormSection } from './workspace'
import { StructuredRows } from '../structured-rows'
import { errorMessage } from '../../errors'
import { Link, useBlocker, useNavigate } from '@tanstack/react-router'
import { useServerFn } from '@tanstack/react-start'
import { useEffect, useRef, useState } from 'react'

import { Button } from '@/components/base/buttons/button'
import { Input } from '@/components/base/input/input'
import { TextArea } from '@/components/base/textarea/textarea'

import { createAdminProduct, updateAdminProduct } from '../../product.functions'
import { slugify } from '../../slug'

import type { ProductInput } from '@nsheth/product'

interface ProductFormProps {
  currentSlug?: string
  initial?: ProductInput & { version?: number }
}

export function ProductForm({ currentSlug, initial }: ProductFormProps) {
  const createProduct = useServerFn(createAdminProduct)
  const updateProduct = useServerFn(updateAdminProduct)
  const navigate = useNavigate()
  const [error, setError] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const [name, setName] = useState(initial?.name ?? '')
  const [slug, setSlug] = useState(initial?.slug ?? '')
  const [slugEdited, setSlugEdited] = useState(Boolean(initial))
  const [isDirty, setIsDirty] = useState(false)
  const bypassBlocker = useRef(false)
  const errorRef = useRef<HTMLParagraphElement>(null)

  useBlocker({
    enableBeforeUnload: isDirty,
    shouldBlockFn: () =>
      isDirty &&
      !bypassBlocker.current &&
      !window.confirm('Discard your unsaved product changes?'),
  })

  useEffect(() => {
    if (error) errorRef.current?.focus()
  }, [error])

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const formData = new FormData(event.currentTarget)
    const data: ProductInput = {
      name: String(formData.get('name') ?? ''),
      slug: String(formData.get('slug') ?? ''),
      summary: String(formData.get('summary') ?? ''),
      description: String(formData.get('description') ?? ''),
      status: formData.get('status') === 'PUBLISHED' ? 'PUBLISHED' : 'DRAFT',
      sku: String(formData.get('sku') ?? ''),
      brand: String(formData.get('brand') ?? ''),
      unit: String(formData.get('unit') ?? 'piece'),
      category: String(formData.get('category') ?? ''),
      tags: [
        ...new Set(
          String(formData.get('tags') ?? '')
            .split(',')
            .map((value) => value.trim())
            .filter(Boolean),
        ),
      ],
      gallery: JSON.parse(String(formData.get('gallery') ?? '[]')),
      specifications: JSON.parse(
        String(formData.get('specifications') ?? '[]'),
      ),
      seoTitle: String(formData.get('seoTitle') ?? ''),
      seoDescription: String(formData.get('seoDescription') ?? ''),
    }

    setError('')
    setIsSaving(true)

    try {
      const product = currentSlug
        ? await updateProduct({
            data: {
              ...data,
              currentSlug,
              expectedVersion: initial?.version ?? 1,
            },
          })
        : await createProduct({ data })
      bypassBlocker.current = true
      await navigate({
        to: '/admin/products/$slug',
        params: { slug: product.slug },
      })
    } catch (failure) {
      bypassBlocker.current = false
      setError(
        errorMessage(
          failure,
          'Could not save this product. Check the fields and slug.',
        ),
      )
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <form
      className="grid max-w-4xl gap-6"
      onChange={() => setIsDirty(true)}
      onSubmit={handleSubmit}
    >
      <FormSection
        title="Product story"
        description="Give customers a clear name and description."
      >
        <Input
          isRequired
          label="Name"
          maxLength={160}
          minLength={3}
          name="name"
          value={name}
          onChange={(value) => {
            setName(value)
            if (!slugEdited) setSlug(slugify(value))
          }}
        />
        <Input
          hint="Generated from the name. Edit it only when the URL needs to differ."
          isRequired
          label="URL slug"
          maxLength={160}
          minLength={3}
          name="slug"
          pattern="[a-z0-9]+(?:-[a-z0-9]+)*"
          value={slug}
          onChange={(value) => {
            setSlug(value)
            setSlugEdited(true)
          }}
        />
        <TextArea
          defaultValue={initial?.summary}
          isRequired
          label="Summary"
          maxLength={300}
          name="summary"
          rows={3}
        />
        <TextArea
          defaultValue={initial?.description}
          isRequired
          label="Description"
          maxLength={100000}
          name="description"
          rows={16}
        />
      </FormSection>
      <fieldset className="grid gap-5 rounded-xl border border-secondary p-5">
        <legend className="px-2 font-semibold text-primary">
          Identity & classification
        </legend>
        <div className="grid gap-5 sm:grid-cols-2">
          <Input
            name="sku"
            label="SKU"
            defaultValue={initial?.sku}
            maxLength={80}
            hint="Unique across products and options."
          />
          <Input
            name="brand"
            label="Brand"
            defaultValue={initial?.brand}
            maxLength={100}
          />
          <Input
            name="unit"
            label="Selling unit"
            defaultValue={initial?.unit ?? 'piece'}
            isRequired
            maxLength={30}
          />
          <Input
            name="category"
            label="Collection"
            defaultValue={initial?.category}
            maxLength={100}
          />
        </div>
        <Input
          name="tags"
          label="Tags"
          defaultValue={initial?.tags.join(', ')}
          hint="Comma-separated; up to 15 tags."
          maxLength={650}
        />
      </fieldset>
      <StructuredRows
        name="gallery"
        title="Gallery"
        initial={initial?.gallery}
        fields={[
          {
            key: 'url',
            label: 'HTTPS image URL',
            type: 'url',
            maxLength: 2000,
          },
          { key: 'alt', label: 'Image description', maxLength: 200 },
        ]}
      />
      <StructuredRows
        name="specifications"
        title="Specifications"
        initial={initial?.specifications}
        limit={30}
        fields={[
          { key: 'label', label: 'Specification', maxLength: 80 },
          { key: 'value', label: 'Value', maxLength: 300 },
        ]}
      />
      <fieldset className="grid gap-5 rounded-xl border border-secondary p-5">
        <legend className="px-2 font-semibold text-primary">
          Search appearance
        </legend>
        <Input
          name="seoTitle"
          label="Search title"
          defaultValue={initial?.seoTitle}
          maxLength={70}
          hint="Leave empty to use the product name."
        />
        <TextArea
          name="seoDescription"
          label="Search description"
          defaultValue={initial?.seoDescription}
          maxLength={170}
          rows={3}
        />
      </fieldset>
      <label
        className="grid gap-1.5 text-sm font-medium text-secondary"
        htmlFor="product-status"
      >
        Publication state
        <select
          className="min-h-11 w-full rounded-lg bg-primary px-3.5 py-2.5 text-md text-primary shadow-xs ring-1 ring-primary ring-inset outline-hidden focus:ring-2 focus:ring-brand"
          defaultValue={initial?.status ?? 'DRAFT'}
          id="product-status"
          name="status"
        >
          <option value="DRAFT">Draft</option>
          <option value="PUBLISHED">Published</option>
        </select>
      </label>
      {error ? (
        <p
          className="m-0 text-sm text-error-primary"
          ref={errorRef}
          role="alert"
          tabIndex={-1}
        >
          {error}
        </p>
      ) : null}
      <div className="flex flex-col-reverse gap-3 sm:flex-row">
        <Link
          className="inline-flex min-h-10 items-center justify-center rounded-lg bg-primary px-3.5 py-2.5 text-sm font-semibold text-secondary shadow-xs-skeuomorphic ring-1 ring-primary ring-inset hover:bg-primary_hover"
          to={currentSlug ? '/admin/products/$slug' : '/admin/products'}
          params={currentSlug ? { slug: currentSlug } : {}}
        >
          Cancel
        </Link>
        <Button
          isDisabled={isSaving}
          isLoading={isSaving}
          showTextWhileLoading
          type="submit"
        >
          {currentSlug ? 'Save changes' : 'Create product'}
        </Button>
      </div>
    </form>
  )
}
