import { appConfig } from '../app.config'
import { requireRouteModule } from '../module-route'
import { createFileRoute } from '@tanstack/react-router'
import { PublicLayout } from '../components/public-layout'

export const Route = createFileRoute('/services')({
  beforeLoad: () => requireRouteModule('booking'),
  component: PublicLayout,
  head: () => ({ meta: [{ title: `Services | ${appConfig.name}` }] }),
})
