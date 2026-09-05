import { createContext, useContext, useEffect, useState } from 'react'
import { Store, useSelector } from '@tanstack/react-store'
import { z } from 'zod'
import type { ReactNode } from 'react'

const storedLine = z.object({
  productId: z.uuid(),
  name: z.string().max(160),
  slug: z.string().max(160),
  price: z.number().int().nonnegative(),
  quantity: z.number().int().min(1).max(99),
})
type Line = z.infer<typeof storedLine>
const CartContext = createContext<Store<Array<Line>> | null>(null)
export function CartProvider({ children }: { children: ReactNode }) {
  // Per-provider stores avoid state sharing across SSR requests.
  const [store] = useState(() => new Store<Array<Line>>([]))
  useEffect(() => {
    try {
      const parsed = z
        .array(storedLine)
        .max(50)
        .safeParse(JSON.parse(localStorage.getItem('nsheth-cart') ?? '[]'))
      if (parsed.success) store.setState(() => parsed.data)
    } catch {
      /* Storage can be disabled. The in-memory cart still works. */
    }
    const subscription = store.subscribe(() => {
      try {
        localStorage.setItem('nsheth-cart', JSON.stringify(store.get()))
      } catch {
        /* The cart remains usable without storage. */
      }
    })
    return () => subscription.unsubscribe()
  }, [store])
  return <CartContext.Provider value={store}>{children}</CartContext.Provider>
}
export function useCart() {
  const store = useContext(CartContext)
  if (!store) throw new Error('CartProvider is required')
  const lines = useSelector(store, (s) => s)
  return {
    lines,
    add: (product: Omit<Line, 'quantity'>) =>
      store.setState((current) => {
        const found = current.find((l) => l.productId === product.productId)
        return found
          ? current.map((l) =>
              l.productId === product.productId
                ? { ...l, quantity: Math.min(99, l.quantity + 1) }
                : l,
            )
          : current.length < 50
            ? [...current, { ...product, quantity: 1 }]
            : current
      }),
    setQuantity: (id: string, quantity: number) =>
      store.setState((current) =>
        quantity < 1
          ? current.filter((l) => l.productId !== id)
          : current.map((l) =>
              l.productId === id
                ? { ...l, quantity: Math.min(99, quantity) }
                : l,
            ),
      ),
    clear: () => store.setState(() => []),
  }
}
