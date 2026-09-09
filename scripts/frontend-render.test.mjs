// Component rendering only: no browser, DOM emulation, network or database.
import assert from "node:assert/strict";
import { test } from "node:test";
import { registerHooks } from "node:module";
import "./typescript-test-loader.mjs";
const productFunctions = new URL(
  "../apps/playground/src/product.functions.ts",
  import.meta.url,
).href;
registerHooks({
  load(url, context, next) {
    if (url === productFunctions)
      return {
        format: "module",
        shortCircuit: true,
        source:
          'export async function getPublishedProducts(){return [{id:"sample",slug:"sample",name:"Sample product",summary:"A product with useful details",brand:"Studio",category:"Workspace",tags:["desk"],imageUrl:""}]}',
      };
    return next(url, context);
  },
});
const React = await import("react");
const { renderToString } = await import("react-dom/server");
const {
  createRouter,
  createRootRoute,
  RouterProvider,
  Outlet,
  createMemoryHistory,
} = await import("@tanstack/react-router");
const { Route: catalogue } =
  await import("../apps/playground/src/routes/catalogue.tsx");
const { Route: index } =
  await import("../apps/playground/src/routes/catalogue.index.tsx");
const root = createRootRoute({ component: Outlet });
catalogue.update({ path: "/catalogue", getParentRoute: () => root });
index.update({ path: "/", getParentRoute: () => catalogue });
const tree = root.addChildren([catalogue.addChildren([index])]);
for (const isServer of [true, false])
  test(
    "catalogue components render with " +
      (isServer ? "server" : "client-reactive") +
      " router stores",
    async () => {
      const router = createRouter({
        routeTree: tree,
        history: createMemoryHistory({ initialEntries: ["/catalogue"] }),
        isServer,
      });
      await router.load();
      const html = renderToString(
        React.createElement(RouterProvider, { router }),
      );
      assert.match(html, /Explore the catalogue/);
      assert.match(html, /Search products, brands or tags/);
      assert.match(html, /href="\/account"/);
      assert.match(html, /Sample product/);
      assert.doesNotMatch(html, /Something needs attention/);
    },
  );
const { ObjectCollection } =
  await import("../apps/playground/src/components/admin/workspace.tsx");
test("page failure can render without a router context and offers a document reload", async () => {
  const { RouteError } =
    await import("../apps/playground/src/components/route-feedback.tsx");
  const html = renderToString(
    React.createElement(RouteError, {
      error: new TypeError(
        "Cannot read properties of null (reading 'useContext')",
      ),
    }),
  );
  assert.match(html, /Reload page/);
  assert.doesNotMatch(html, /useContext|TypeError/);
});
test("object collections render labelled filters, useful record links and empty states", () => {
  const props = {
    eyebrow: "Sell",
    title: "Products",
    description: "Manage products",
    objects: [
      {
        id: "p1",
        title: "Sample product",
        subtitle: "A useful object",
        status: "DRAFT",
        href: "/admin/products/sample",
      },
    ],
  };
  const html = renderToString(React.createElement(ObjectCollection, props));
  assert.match(html, /href="\/admin\/products\/sample"/);
  assert.match(html, /Search products/);
  assert.match(html, /Sample product/);
  assert.doesNotMatch(html, /<table/);
  const empty = renderToString(
    React.createElement(ObjectCollection, { ...props, objects: [] }),
  );
  assert.match(empty, /No products yet/);
});

test("object collections render only the current page, never vertically append later pages", () => {
  const html = renderToString(
    React.createElement(ObjectCollection, {
      eyebrow: "Sell",
      title: "Products",
      description: "Manage products",
      objects: Array.from({ length: 25 }, (_, index) => ({
        id: String(index),
        title: `Product ${index}`,
        subtitle: "Pagination fixture",
        status: "DRAFT",
        href: `/admin/products/item-${index}`,
      })),
    }),
  );
  assert.equal(
    new Set(html.match(/href="\/admin\/products\/item-\d+"/g) ?? []).size,
    12,
  );
  assert.match(html, /href="\/admin\/products\/item-11"/);
  assert.doesNotMatch(html, /href="\/admin\/products\/item-(12|24)"/);
  assert.equal((html.match(/<h1(?:\s|>)/g) ?? []).length, 1);
});

test("attention filters open the requested status and single-page collections omit pagination", () => {
  const html = renderToString(
    React.createElement(ObjectCollection, {
      eyebrow: "Schedule",
      title: "Appointments",
      description: "Requests",
      initialStatus: "REQUESTED",
      objects: [
        {
          id: "new",
          title: "New request",
          subtitle: "Customer",
          status: "REQUESTED",
          href: "/admin/bookings?record=new",
        },
        {
          id: "done",
          title: "Confirmed visit",
          subtitle: "Customer",
          status: "CONFIRMED",
          href: "/admin/bookings?record=done",
        },
      ],
    }),
  );
  assert.match(html, /New request/);
  assert.doesNotMatch(html, /Confirmed visit|Collection pages/);
  assert.match(html.replaceAll("<!-- -->", ""), /1 of 2 appointments/);
});

test("navigation offers creation only with the matching write permission", async () => {
  const { QuickNavigation } =
    await import("../apps/playground/src/components/admin/quick-navigation.tsx");
  const props = {
    modules: [
      {
        id: "content-posts",
        label: "Posts",
        group: "Publish",
        href: "/admin/posts",
        permission: "content.read",
      },
    ],
    principal: {
      id: "test",
      email: "test@example.local",
      roles: ["viewer"],
      permissions: ["content.read"],
    },
  };
  const readOnly = renderToString(React.createElement(QuickNavigation, props));
  assert.match(readOnly, /href="\/admin\/posts"/);
  assert.doesNotMatch(readOnly, /href="\/admin\/posts\/new"/);
  const editor = renderToString(
    React.createElement(QuickNavigation, {
      ...props,
      principal: {
        ...props.principal,
        permissions: ["content.read", "content.write"],
      },
    }),
  );
  assert.match(editor, /href="\/admin\/posts\/new"/);
});
