import { FormSection } from './workspace'
import { useState } from 'react'
import { useServerFn } from '@tanstack/react-start'
import { Input } from '../base/input/input'
import { TextArea } from '../base/textarea/textarea'
import { ActionForm, SelectField } from '../workflow'
import { saveProperty } from '../../hospitality.functions'
import { slugify } from '../../slug'
import type { PropertyInput } from '@nsheth/hospitality'

export function PropertyForm({
  initial,
}: {
  initial?: PropertyInput & { version: number }
}) {
  const save = useServerFn(saveProperty)
  const [slug, setSlug] = useState(initial?.slug ?? '')
  const [edited, setEdited] = useState(Boolean(initial))
  return (
    <ActionForm
      guard
      cancelHref={
        initial ? '/admin/properties/' + initial.slug : '/admin/properties'
      }
      label={initial ? 'Save property' : 'Create property'}
      action={async (form) => {
        const property = await save({
          data: {
            currentSlug: initial?.slug,
            expectedVersion: initial?.version,
            address: String(form.get('address')),
            checkInTime: String(form.get('checkInTime')),
            checkOutTime: String(form.get('checkOutTime')),
            policy: String(form.get('policy')),
            cancelNoticeDays: Number(form.get('cancelNoticeDays')),
            amenities: String(form.get('amenities'))
              .split(',')
              .map((s) => s.trim())
              .filter(Boolean),

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
      <FormSection
        title="Property identity"
        description="Introduce the place and what makes a stay here useful."
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
          label="Page address"
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
      </FormSection>
      <FormSection
        title="Location"
        description="Help guests find the property and understand local dates."
      >
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
        <Input
          name="address"
          label="Street address"
          maxLength={500}
          defaultValue={initial?.address ?? ''}
        />
      </FormSection>
      <FormSection
        title="Guest policies"
        description="Set arrival, departure and cancellation expectations."
      >
        <Input
          name="checkInTime"
          label="Check-in from (HH:MM)"
          maxLength={5}
          defaultValue={initial?.checkInTime ?? '14:00'}
        />
        <Input
          name="checkOutTime"
          label="Check-out by (HH:MM)"
          maxLength={5}
          defaultValue={initial?.checkOutTime ?? '11:00'}
        />
        <TextArea
          name="policy"
          label="House and cancellation rules"
          maxLength={4000}
          defaultValue={initial?.policy ?? ''}
        />
        <Input
          name="cancelNoticeDays"
          label="Cancellation notice (days before arrival)"
          type="number"
          min={0}
          max={30}
          isRequired
          defaultValue={String(initial?.cancelNoticeDays ?? 1)}
        />
      </FormSection>
      <FormSection
        title="Amenities & publication"
        description="Describe what is included and choose visibility."
      >
        <Input
          name="amenities"
          label="Amenities (comma separated)"
          maxLength={1800}
          defaultValue={initial?.amenities.join(', ')}
        />
        <SelectField
          label="Visibility"
          name="status"
          defaultValue={initial?.status ?? 'DRAFT'}
        >
          <option value="DRAFT">Draft</option>
          <option value="PUBLISHED">Published</option>
        </SelectField>
      </FormSection>
    </ActionForm>
  )
}
