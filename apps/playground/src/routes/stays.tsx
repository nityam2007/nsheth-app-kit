import { createFileRoute } from '@tanstack/react-router'
import { PublicLayout } from '../components/public-layout'

export const Route = createFileRoute('/stays')({
  component: PublicLayout,
  head: () => ({ meta: [{ title: 'Places to stay | NSheth App Kit' }] }),
})
