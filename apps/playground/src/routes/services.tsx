import { createFileRoute } from '@tanstack/react-router'
import { PublicLayout } from '../components/public-layout'

export const Route = createFileRoute('/services')({
  component: PublicLayout,
  head: () => ({ meta: [{ title: 'Services | NSheth App Kit' }] }),
})
