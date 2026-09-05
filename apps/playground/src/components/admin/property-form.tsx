import { useState } from 'react'
import { useServerFn } from '@tanstack/react-start'
import { Input } from '../base/input/input'
import { TextArea } from '../base/textarea/textarea'
import { ActionForm, SelectField } from '../workflow'
import { saveProperty } from '../../hospitality.functions'
import { slugify } from '../../slug'
import type { PropertyInput } from '@nsheth/hospitality'

export function PropertyForm({ initial }: { initial?: PropertyInput }) {
  const save = useServerFn(saveProperty)
  const [slug, setSlug] = useState(initial?.slug ?? '')
  const [edited, setEdited] = useState(Boolean(initial))
  return (
    <ActionForm
      guard
      label={initial ? 'Save property' : 'Create property'}
      action={async (form) => {
        const property = await save({
          data: {
            currentSlug: initial?.slug,
            name: String(form.get('name')),
            slug: String(form.get('slug')),
            summary: String(form.get('summary')),
            description: String(form.get('description')),
            location: String(form.get('location')),
            timezone: String(form.get('timezone')),
            status: form.get('status') === 'PUBLISHED' ? 'PUBLISHED' : 'DRAFT',
          },
        })
        return `/admin/properties/${property.slug}`
      }}
    >
      <Input
        name="name"
        label="Property name"
        isRequired
        minLength={3}
        maxLength={160}
        defaultValue={initial?.name}
        onChange={(value) => {
          if (!edited) setSlug(slugify(value))
        }}
      />
      <Input
        name="slug"
        label="URL slug"
        isRequired
        minLength={3}
        maxLength={160}
        pattern="[a-z0-9]+(?:-[a-z0-9]+)*"
        value={slug}
        onChange={(value) => {
          setSlug(value)
          setEdited(true)
        }}
      />
      <TextArea
        name="summary"
        label="Summary"
        isRequired
        maxLength={300}
        defaultValue={initial?.summary}
      />
      <TextArea
        name="description"
        label="Description"
        isRequired
        maxLength={100000}
        defaultValue={initial?.description}
        rows={8}
      />
      <Input
        name="location"
        label="Location"
        isRequired
        minLength={2}
        maxLength={200}
        defaultValue={initial?.location}
      />
      <Input
        name="timezone"
        label="IANA timezone"
        isRequired
        defaultValue={initial?.timezone ?? 'Asia/Kolkata'}
        hint="For example Asia/Kolkata or Europe/London. Arrival dates use the local day at this property."
      />
      <SelectField
        label="Visibility"
        name="status"
        defaultValue={initial?.status ?? 'DRAFT'}
      >
        <option value="DRAFT">Draft</option>
        <option value="PUBLISHED">Published</option>
      </SelectField>
    </ActionForm>
  )
}
