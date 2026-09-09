import { spawn } from "node:child_process";
import { createRequire } from "node:module";
import { resolve, dirname } from "node:path";
import { Client } from "pg";
import {
  root,
  configuration,
  localDatabase,
  checkDatabase,
} from "./local-database.mjs";
import { assertDevelopmentPortFree } from "./local-server.mjs";

export function assertResetTarget(env) {
  const url = new URL(env.DATABASE_URL || "");
  if (
    env.NODE_ENV === "production" ||
    !["postgres:", "postgresql:"].includes(url.protocol) ||
    !["localhost", "127.0.0.1", "[::1]"].includes(url.hostname) ||
    url.pathname !== "/nsheth_app_kit"
  )
    throw new Error(
      "Reset is restricted to the local nsheth_app_kit development database.",
    );
  return url;
}

export async function resetLocal() {
  if (!process.argv.includes("--yes"))
    throw new Error(
      "This deletes ALL local development data. Stop dev, then run npm run db:reset:local -- --yes to confirm.",
    );
  assertResetTarget(await configuration());
  await assertDevelopmentPortFree();
  const database = await localDatabase({ start: true });
  try {
    const url = assertResetTarget(database.env);
    url.pathname = "/postgres";
    const admin = new Client({
      connectionString: url.toString(),
      connectionTimeoutMillis: 10000,
      query_timeout: 30000,
    });
    try {
      await admin.connect();
      await admin.query("DROP DATABASE IF EXISTS nsheth_app_kit WITH (FORCE)");
      await admin.query("CREATE DATABASE nsheth_app_kit");
    } finally {
      await admin.end();
    }
    const prisma = resolve(
      dirname(
        createRequire(
          new URL("../apps/playground/package.json", import.meta.url),
        ).resolve("prisma/package.json"),
      ),
      "build/index.js",
    );
    for (const args of [
      [prisma, "generate"],
      [prisma, "migrate", "deploy"],
      ["--import", "tsx", resolve(root, "scripts/seed-dev.mts")],
    ]) {
      await new Promise((done, reject) => {
        const child = spawn(process.execPath, args, {
          cwd: resolve(root, "apps/playground"),
          env: database.env,
          stdio: "inherit",
          windowsHide: true,
        });
        child.once("error", reject);
        child.once("exit", (code) =>
          code === 0
            ? done()
            : reject(
                new Error(
                  "Local reset setup failed. Run npm run setup, then npm run seed:dev.",
                ),
              ),
        );
      });
    }
    await checkDatabase(database.env);
    console.log(
      "Local database recreated and seeded. Development server remains stopped.",
    );
  } finally {
    await database.close();
  }
}
if (
  process.argv[1] &&
  resolve(process.argv[1]) === resolve(root, "scripts/reset-local.mjs")
)
  await resetLocal().catch((error) => {
    console.error(error.message);
    process.exitCode = 1;
  });
