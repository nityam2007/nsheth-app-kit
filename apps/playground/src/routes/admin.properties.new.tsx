import { createFileRoute } from '@tanstack/react-router'
import { PropertyForm } from '../components/admin/property-form'
import { PageHeading } from '../components/workflow'

export const Route = createFileRoute('/admin/properties/new')({
  component: () => (
    <section className="max-w-3xl">
      <PageHeading eyebrow="Hospitality" title="New property" />
      <PropertyForm />
    </section>
  ),
})
