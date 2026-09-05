import { useState } from 'react'
import { useServerFn } from '@tanstack/react-start'
import { Input } from '../base/input/input'
import { TextArea } from '../base/textarea/textarea'
import { ActionForm, SelectField } from '../workflow'
import { saveAdminService } from '../../booking.functions'
import { slugify } from '../../slug'
import type { ServiceInput } from '@nsheth/booking'

export function ServiceForm({ initial }: { initial?: ServiceInput }) {
  const save = useServerFn(saveAdminService)
  const [slug, setSlug] = useState(initial?.slug ?? '')
  const [edited, setEdited] = useState(Boolean(initial))
  return (
    <ActionForm
      guard
      label={initial ? 'Save service' : 'Create service'}
      action={async (form) => {
        const service = await save({
          data: {
            currentSlug: initial?.slug,
            name: String(form.get('name')),
            slug: String(form.get('slug')),
            summary: String(form.get('summary')),
            description: String(form.get('description')),
            durationMinutes: Number(form.get('durationMinutes')),
            status: form.get('status') === 'PUBLISHED' ? 'PUBLISHED' : 'DRAFT',
          },
        })
        return `/admin/services/${service.slug}`
      }}
    >
      <Input
        name="name"
        label="Service name"
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
        name="durationMinutes"
        label="Duration in minutes"
        type="number"
        min={5}
        max={1440}
        isRequired
        defaultValue={String(initial?.durationMinutes ?? 60)}
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
