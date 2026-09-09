import assert from "node:assert/strict";
import { toJSON } from "seroval";
const origin = process.env.TEST_URL || "http://localhost:3000";
let cookie = "";
const ids = new Map<string, string>();
async function call(
  file: string,
  name: string,
  method = "GET",
  data?: unknown,
) {
  if (!ids.has(name)) {
    const response = await fetch(`${origin}/src/${file}.functions.ts`);
    assert.equal(
      response.status,
      200,
      "Development server module must be available",
    );
    const source = await response.text();
    for (const block of source.split("export const ")) {
      const name = block.match(/^(\w+) =/)?.[1],
        id = block.match(/createClientRpc\("([^"]+)"\)/)?.[1];
      if (name && id) ids.set(name, id);
    }
  }
  const id = ids.get(name);
  assert.ok(id, `Missing ${name}`);
  const payload = JSON.stringify(toJSON({ data })),
    url = new URL(`/_serverFn/${id}`, origin);
  if (method === "GET") url.searchParams.set("payload", payload);
  return fetch(url, {
    method,
    headers: {
      origin,
      cookie,
      "x-tsr-serverFn": "true",
      "content-type": "application/json",
    },
    ...(method === "POST" ? { body: payload } : {}),
  });
}
for (const path of [
  "/",
  "/login",
  "/register",
  "/verify-email",
  "/forgot-password",
  "/reset-password",
  "/blog",
  "/catalogue",
  "/services",
  "/stays",
  "/shop",
  "/shop/cart",
  "/privacy",
  "/payment-return",
]) {
  const response = await fetch(origin + path);
  assert.equal(response.status, 200, path);
  const html = await response.text();
  assert.equal(
    (html.match(/<main(?:\s|>)/g) ?? []).length,
    1,
    path + " has one main",
  );
  assert.equal(
    (html.match(/<h1(?:\s|>)/g) ?? []).length,
    1,
    path + " has one heading",
  );
  assert.ok(
    !html.includes("Invalid `getPrisma") &&
      !html.includes("Something needs attention"),
    path + " must render content",
  );
  assert.equal(response.headers.get("x-content-type-options"), "nosniff");
  if (path === "/login") {
    assert.match(html, /<main[ >]/);
    assert.match(html, /Use development admin/);
    assert.ok(
      html.includes("Continue with GitHub") ||
        html.includes("GitHub sign-in is not configured"),
    );
  }
}
for (const path of [
  "/unknown-page",
  "/catalogue/not-a-published-product",
  "/services/not-a-service",
  "/stays/not-a-property",
])
  assert.equal((await fetch(origin + path)).status, 404, path);
for (const path of [
  "/admin",
  "/admin/products",
  "/admin/posts/new",
  "/account",
  "/account/profile",
  "/account/security",
]) {
  const response = await fetch(origin + path, { redirect: "manual" });
  assert.equal(
    response.status,
    307,
    path + " must redirect anonymous visitors, not return an empty 401",
  );
  assert.equal(response.headers.get("location"), "/login");
  assert.match(response.headers.get("cache-control") ?? "", /no-store/);
  assert.equal(response.headers.get("x-app-status"), null);
  const loginPage = await fetch(origin + path);
  assert.equal(loginPage.status, 200);
  assert.equal(new URL(loginPage.url).pathname, "/login");
  assert.match(await loginPage.text(), /Use development admin/);
}
assert.equal((await call("product", "getAdminProducts")).status, 401);
const login = await call("identity", "createDemoIdentitySession", "POST");
assert.equal(login.status, 200);
cookie = login.headers
  .getSetCookie()
  .map((value) => value.split(";")[0])
  .join("; ");
assert.ok(cookie);
// Independent development tabs remain signed in; re-login rotates only its own cookie.
const originalCookie = cookie;
cookie = "";
const independentLogin = await call(
  "identity",
  "createDemoIdentitySession",
  "POST",
);
assert.equal(independentLogin.status, 200);
const independentCookie = independentLogin.headers
  .getSetCookie()
  .map((value) => value.split(";")[0])
  .join("; ");
cookie = originalCookie;
assert.equal(
  (await call("admin", "getAdminContext")).status,
  200,
  "Another tab cannot revoke this session",
);
const rotatedLogin = await call(
  "identity",
  "createDemoIdentitySession",
  "POST",
);
assert.equal(rotatedLogin.status, 200);
assert.equal(
  (await call("admin", "getAdminContext")).status,
  401,
  "Re-login revokes the previous cookie",
);
cookie = independentCookie;
assert.equal(
  (await call("admin", "getAdminContext")).status,
  200,
  "Other tab survives rotation",
);
cookie = rotatedLogin.headers
  .getSetCookie()
  .map((value) => value.split(";")[0])
  .join("; ");
for (const path of [
  "/admin",
  "/admin/products",
  "/admin/posts",
  "/admin/services",
  "/admin/properties",
  "/admin/orders",
  "/admin/bookings",
  "/admin/reservations",
  "/admin/access",
  "/admin/privacy",
  "/admin/enquiries",
  "/admin/users",
  "/account",
  "/account/profile",
  "/account/security",
]) {
  const response = await fetch(origin + path, {
    headers: { cookie },
    redirect: "manual",
  });
  assert.equal(response.status, 200, path);
  const html = await response.text();
  assert.equal(
    (html.match(/<main(?:\s|>)/g) ?? []).length,
    1,
    path + " has one main",
  );
  assert.equal(
    (html.match(/<h1(?:\s|>)/g) ?? []).length,
    1,
    path + " has one heading",
  );
  assert.ok(
    !html.includes("Something needs attention") &&
      !html.includes("data service is unavailable"),
    path + " must render",
  );
}
for (const path of ["/src/router.tsx", "/src/styles.css"]) {
  const response = await fetch(origin + path);
  assert.equal(response.status, 200);
  assert.match(
    response.headers.get("cache-control") ?? "",
    /no-store/,
    path + " cannot keep stale module URLs",
  );
}
console.log(
  "HTTP smoke passed: public routes, missing resources, anonymous login redirects, API isolation, signed-in admin modules, account and security headers. No browser used.",
);
