import { appConfig } from '../app.config'
import { requireRouteModule } from '../module-route'
import { createFileRoute } from '@tanstack/react-router'
import { PublicLayout } from '../components/public-layout'

export const Route = createFileRoute('/stays')({
  beforeLoad: () => requireRouteModule('hospitality'),
  component: PublicLayout,
  head: () => ({ meta: [{ title: `Places to stay | ${appConfig.name}` }] }),
})
