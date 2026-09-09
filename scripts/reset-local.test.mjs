import { test } from "node:test";
import assert from "node:assert/strict";
import { assertResetTarget } from "./reset-local.mjs";

test("development reset rejects production, remote hosts and other databases", () => {
  for (const DATABASE_URL of [
    "postgres://localhost/production",
    "postgres://db.example/nsheth_app_kit",
    "mysql://localhost/nsheth_app_kit",
  ])
    assert.throws(() => assertResetTarget({ DATABASE_URL }), /restricted/);
  assert.throws(
    () =>
      assertResetTarget({
        DATABASE_URL: "postgres://localhost/nsheth_app_kit",
        NODE_ENV: "production",
      }),
    /restricted/,
  );
  assert.equal(
    assertResetTarget({
      DATABASE_URL: "postgres://127.0.0.1:5432/nsheth_app_kit",
    }).pathname,
    "/nsheth_app_kit",
  );
});
