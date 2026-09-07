// Component rendering only: no browser, DOM emulation, network or database.
import assert from 'node:assert/strict'
import { test } from 'node:test'
import { registerHooks } from 'node:module'
import './typescript-test-loader.mjs'
const productFunctions = new URL(
  '../apps/playground/src/product.functions.ts',
  import.meta.url,
).href
registerHooks({
  load(url, context, next) {
    if (url === productFunctions)
      return {
        format: 'module',
        shortCircuit: true,
        source:
          'export async function getPublishedProducts(){return [{id:"sample",slug:"sample",name:"Sample product",summary:"A product with useful details",brand:"Studio",category:"Workspace",tags:["desk"],imageUrl:""}]}',
      }
    return next(url, context)
  },
})
const React = await import('react')
const { renderToString } = await import('react-dom/server')
const {
  createRouter,
  createRootRoute,
  RouterProvider,
  Outlet,
  createMemoryHistory,
} = await import('@tanstack/react-router')
const { Route: catalogue } =
  await import('../apps/playground/src/routes/catalogue.tsx')
const { Route: index } =
  await import('../apps/playground/src/routes/catalogue.index.tsx')
const root = createRootRoute({ component: Outlet })
catalogue.update({ path: '/catalogue', getParentRoute: () => root })
index.update({ path: '/', getParentRoute: () => catalogue })
const tree = root.addChildren([catalogue.addChildren([index])])
for (const isServer of [true, false])
  test(
    'catalogue components render with ' +
      (isServer ? 'server' : 'client-reactive') +
      ' router stores',
    async () => {
      const router = createRouter({
        routeTree: tree,
        history: createMemoryHistory({ initialEntries: ['/catalogue'] }),
        isServer,
      })
      await router.load()
      const html = renderToString(
        React.createElement(RouterProvider, { router }),
      )
      assert.match(html, /Explore the catalogue/)
      assert.match(html, /Search products, brands or tags/)
      assert.match(html, /Your account/)
      assert.match(html, /Sample product/)
      assert.doesNotMatch(html, /Something needs attention/)
    },
  )
const { ObjectCollection } =
  await import('../apps/playground/src/components/admin/workspace.tsx')
test('object collections render labelled filters, useful record links and empty states', () => {
  const props = {
    eyebrow: 'Sell',
    title: 'Products',
    description: 'Manage products',
    objects: [
      {
        id: 'p1',
        title: 'Sample product',
        subtitle: 'A useful object',
        status: 'DRAFT',
        href: '/admin/products/sample',
      },
    ],
  }
  const html = renderToString(React.createElement(ObjectCollection, props))
  assert.match(html, /href="\/admin\/products\/sample"/)
  assert.match(html, /Search products/)
  assert.match(html, /Sample product/)
  assert.doesNotMatch(html, /<table/)
  const empty = renderToString(
    React.createElement(ObjectCollection, { ...props, objects: [] }),
  )
  assert.match(empty, /No products yet/)
})
