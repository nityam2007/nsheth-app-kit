import { spawn } from "node:child_process";
import { resolve } from "node:path";
import { root, localDatabase, checkDatabase } from "./local-database.mjs";
import { assertDevelopmentPortFree } from "./local-server.mjs";
let database, child, closing;
async function close() {
  if (closing) return closing;
  closing = (async () => {
    if (child?.pid && child.exitCode === null && child.signalCode === null) {
      const exited = new Promise((done) => child.once("exit", done));
      child.kill();
      const force = setTimeout(() => child.kill("SIGKILL"), 3000);
      try {
        await exited;
      } finally {
        clearTimeout(force);
      }
    }
    await database?.close();
  })();
  return closing;
}
for (const signal of ["SIGINT", "SIGTERM"])
  process.on(signal, () => {
    void close().then(() => process.exit(0));
  });
try {
  if (!process.argv.includes("--check")) await assertDevelopmentPortFree();
  database = await localDatabase({ start: true });
  await checkDatabase(database.env);
  if (!process.argv.includes("--check")) {
    child = spawn(
      process.execPath,
      [resolve(root, "node_modules/vite/bin/vite.js"), "dev", "--port", "3000"],
      {
        cwd: resolve(root, "apps/playground"),
        env: database.env,
        stdio: "inherit",
        windowsHide: true,
      },
    );
    process.exitCode = await new Promise((resolve, reject) => {
      child.on("error", reject);
      child.on("exit", (code) => resolve(code ?? 0));
    });
  }
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
} finally {
  await close();
}
