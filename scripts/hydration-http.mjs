// Execute Vite's actual client modules in Node's VM and a DOM implementation.
// No browser process, layout engine, external resources, or screenshots.
import { JSDOM, VirtualConsole } from "jsdom";
import { SourceTextModule, SyntheticModule } from "node:vm";
import { toJSON } from "seroval";
import assert from "node:assert/strict";

const origin = process.env.TEST_URL ?? "http://localhost:3000";
assert.ok(
  ["localhost", "127.0.0.1", "[::1]"].includes(new URL(origin).hostname),
);
const paths = process.argv.slice(2).length
  ? process.argv.slice(2)
  : [
      "/",
      "/login",
      "/register",
      "/verify-email",
      "/forgot-password",
      "/reset-password",
      "/blog",
      "/catalogue",
      "/shop",
      "/shop/cart",
      "/services",
      "/stays",
      "/privacy",
      "/payment-return",
      "/admin",
      "/admin/posts",
      "/admin/products",
      "/admin/services",
      "/admin/properties",
      "/admin/orders",
      "/admin/bookings",
      "/admin/reservations",
      "/admin/access",
      "/admin/enquiries",
      "/admin/privacy",
      "/admin/users",
      "/account",
      "/account/profile",
      "/account/security",
    ];
const crawl = process.argv.length === 2;
const visited = new Set(paths);
let cookie = "";
if (
  paths.some((path) => path.startsWith("/admin") || path.startsWith("/account"))
) {
  const source = await (
    await fetch(origin + "/src/identity.functions.ts")
  ).text();
  const id = source
    .split("export const createDemoIdentitySession =")[1]
    ?.match(/createClientRpc\("([^"]+)"\)/)?.[1];
  assert.ok(id);
  const response = await fetch(origin + "/_serverFn/" + id, {
    method: "POST",
    headers: {
      origin,
      "content-type": "application/json",
      "x-tsr-serverFn": "true",
    },
    body: JSON.stringify(toJSON({ data: undefined })),
  });
  assert.equal(response.status, 200);
  cookie = response.headers
    .getSetCookie()
    .map((s) => s.split(";")[0])
    .join("; ");
}
async function checkPage(path) {
  const response = await fetch(origin + path, { headers: { cookie } });
  assert.equal(response.status, 200);
  const html = await response.text();
  const errors = [];
  const virtualConsole = new VirtualConsole();
  virtualConsole.on("error", (...args) => {
    errors.push(args);
    console.error(...args);
  });
  virtualConsole.on("warn", (...args) => console.warn(...args));
  virtualConsole.on("jsdomError", (error) => {
    errors.push(error);
    console.error(error);
  });
  const dom = new JSDOM(html, {
    url: origin + path,
    runScripts: "outside-only",
    virtualConsole,
  });
  const win = dom.window;
  const channels = new Set();
  Object.assign(win, {
    fetch: (input, init) => {
      const url = new URL(
        typeof input === "string" ? input : input.url,
        origin,
      );
      assert.equal(
        url.origin,
        origin,
        "Client checks only call this local app",
      );
      return fetch(url, {
        ...init,
        headers: { cookie, origin, ...init?.headers },
      });
    },
    Request,
    Response,
    Headers,
    TextEncoder,
    TextDecoder,
    ReadableStream,
    TransformStream,
    structuredClone,
    BroadcastChannel: class extends BroadcastChannel {
      constructor(name) {
        super(name);
        channels.add(this);
      }
    },
    matchMedia: (query) => ({
      matches: false,
      media: query,
      addEventListener() {},
      removeEventListener() {},
      addListener() {},
      removeListener() {},
    }),
    requestAnimationFrame: (callback) =>
      setTimeout(() => callback(performance.now()), 16),
    cancelAnimationFrame: clearTimeout,
    ResizeObserver: class {
      observe() {}
      unobserve() {}
      disconnect() {}
    },
    IntersectionObserver: class {
      observe() {}
      unobserve() {}
      disconnect() {}
    },
    scrollTo() {},
  });
  win.HTMLElement.prototype.scrollIntoView = () => {};
  const context = dom.getInternalVMContext();
  const modules = new Map();
  // Concurrent route imports can share modules. Node's VM linker needs those
  // graph-linking operations serialized; evaluation stays outside the queue.
  let linking = Promise.resolve();
  async function ensureLinked(module) {
    const next = linking.then(async () => {
      if (module.status === "unlinked") await module.link(link);
    });
    linking = next.catch(() => {});
    await next;
  }
  async function getModule(url) {
    assert.equal(
      new URL(url).origin,
      origin,
      "Only local development modules are executed",
    );
    if (!modules.has(url))
      modules.set(
        url,
        (async () => {
          if (new URL(url).pathname === "/@vite/client") {
            return new SyntheticModule(
              ["createHotContext", "updateStyle", "removeStyle", "injectQuery"],
              function () {
                this.setExport("createHotContext", () => ({
                  accept() {},
                  acceptExports() {},
                  dispose() {},
                  prune() {},
                  invalidate() {},
                  on() {},
                  off() {},
                  send() {},
                  data: {},
                }));
                this.setExport("updateStyle", () => {});
                this.setExport("removeStyle", () => {});
                this.setExport("injectQuery", (value) => value);
              },
              { context, identifier: url },
            );
          }
          const response = await fetch(url);
          assert.equal(response.status, 200, url);
          return new SourceTextModule(await response.text(), {
            context,
            identifier: url,
            initializeImportMeta(meta) {
              meta.url = url;
            },
            async importModuleDynamically(specifier, referencingModule) {
              const module = await getModule(
                new URL(specifier, referencingModule.identifier).href,
              );
              await ensureLinked(module);
              await module.evaluate();
              return module;
            },
          });
        })(),
      );
    return modules.get(url);
  }
  const link = (specifier, referencingModule) =>
    getModule(new URL(specifier, referencingModule.identifier).href);
  try {
    // Vite installs client-side define values through its env entry, independently
    // of the HMR transport stub above.
    const viteClient = await (await fetch(origin + "/@vite/client")).text();
    const envPath = viteClient.match(
      /import\s+["']([^"']*\/env\.mjs)["']/,
    )?.[1];
    assert.ok(envPath);
    const envModule = await getModule(new URL(envPath, origin).href);
    await envModule.link(link);
    await envModule.evaluate();
    for (const script of win.document.querySelectorAll("script:not([src])")) {
      if (script.type && script.type !== "text/javascript") continue;
      Object.defineProperty(win.document, "currentScript", {
        configurable: true,
        value: script,
      });
      win.eval(script.textContent);
    }
    Object.defineProperty(win.document, "currentScript", {
      configurable: true,
      value: null,
    });
    assert.equal(
      win.document.querySelectorAll("main").length,
      1,
      path + ": one SSR main",
    );
    assert.equal(
      win.document.querySelectorAll("h1").length,
      1,
      path + ": one SSR heading",
    );
    const entry = win.document.querySelector('script[type="module"][src]');
    assert.ok(entry);
    const module = await getModule(entry.src);
    await module.link(link);
    await module.evaluate();
    await new Promise((resolve) => setTimeout(resolve, 2500));
    assert.equal(errors.length, 0, "No hydration or runtime errors");
    assert.equal(
      win.document.querySelectorAll("main").length,
      1,
      "One main after hydration",
    );
    assert.equal(
      win.document.querySelectorAll("h1").length,
      1,
      "One page heading after hydration",
    );
    assert.doesNotMatch(
      win.document.querySelector("main").textContent,
      /Something needs attention|Unable to load this page/,
    );
    const reactModules = [...modules.keys()].filter((url) =>
      /\/deps\/react\.js\?/.test(url),
    );
    assert.equal(reactModules.length, 1, "Exactly one optimized React module");
    const renderer = [...modules.keys()].find((url) =>
      /\/deps\/react-dom_client\.js\?/.test(url),
    );
    assert.ok(renderer);
    assert.equal(
      new URL(reactModules[0]).searchParams.get("v"),
      new URL(renderer).searchParams.get("v"),
      "React and React DOM use the same optimizer version",
    );
    if (crawl)
      for (const anchor of win.document.querySelectorAll("main a[href]")) {
        const url = new URL(anchor.href);
        if (
          url.origin !== origin ||
          !/^\/(?:admin|account|blog|catalogue|shop|services|stays)(?:\/|$)/.test(
            url.pathname,
          )
        )
          continue;
        const next = url.pathname.replace(/\/$/, "") + url.search;
        if (visited.has(next)) continue;
        assert.ok(visited.size < 150, "Bounded local page crawl");
        visited.add(next);
        paths.push(next);
      }
    console.log(
      "Hydration passed:",
      path,
      "(one main, one heading, one React instance)",
    );
  } finally {
    for (const channel of channels) channel.close();
    win.close();
  }
}
for (const path of paths) await checkPage(path);
console.log(
  `Verified ${paths.length} pages using Node VM and jsdom. HMR transport and layout APIs are stubbed; no browser or visual verification.`,
);
