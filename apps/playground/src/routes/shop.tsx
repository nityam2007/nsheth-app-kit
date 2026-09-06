import { appConfig } from '../app.config'
import { requireRouteModule } from '../module-route'
import { createFileRoute } from '@tanstack/react-router'
import { PublicLayout } from '../components/public-layout'
import { CartProvider } from '../components/cart-provider'

export const Route = createFileRoute('/shop')({
  beforeLoad: () => requireRouteModule('commerce'),
  component: () => (
    <CartProvider>
      <PublicLayout />
    </CartProvider>
  ),
  head: () => ({ meta: [{ title: `Shop | ${appConfig.name}` }] }),
})
