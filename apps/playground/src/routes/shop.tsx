import { createFileRoute } from '@tanstack/react-router'
import { PublicLayout } from '../components/public-layout'
import { CartProvider } from '../components/cart-provider'

export const Route = createFileRoute('/shop')({
  component: () => (
    <CartProvider>
      <PublicLayout />
    </CartProvider>
  ),
  head: () => ({ meta: [{ title: 'Shop | NSheth App Kit' }] }),
})
