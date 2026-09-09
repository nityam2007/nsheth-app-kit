import { spawn } from "node:child_process";
import { resolve } from "node:path";
import { root, configuration, localDatabase } from "./local-database.mjs";
import { assertResetTarget } from "./reset-local.mjs";

assertResetTarget(await configuration());
const database = await localDatabase({ start: true });
try {
  await new Promise((done, reject) => {
    const child = spawn(
      process.execPath,
      ["--import", "tsx", resolve(root, "scripts/seed-dev.mts")],
      { cwd: root, env: database.env, stdio: "inherit", windowsHide: true },
    );
    child.once("error", reject);
    child.once("exit", (code) =>
      code === 0 ? done() : reject(new Error("Development seed failed.")),
    );
  });
} finally {
  await database.close();
}
