import { spawn, execFile } from "node:child_process";
import { resolve } from "node:path";
import { root } from "./local-database.mjs";
import { restartQueue, watchFiles } from "./dev-watch.mjs";

let child,
  closing = false;
async function stop() {
  const previous = child;
  child = undefined;
  if (
    !previous?.pid ||
    previous.exitCode !== null ||
    previous.signalCode !== null
  )
    return;
  const exited = new Promise((done) => previous.once("exit", done));
  if (process.platform === "win32") {
    // Kill only our worker and its descendants, including Vite and WSL relays.
    await new Promise((done, reject) =>
      execFile(
        "taskkill",
        ["/PID", String(previous.pid), "/T", "/F"],
        { windowsHide: true },
        (error) => {
          if (
            error &&
            previous.exitCode === null &&
            previous.signalCode === null
          )
            reject(
              new Error(
                "Could not stop the previous development process. Stop it before restarting.",
              ),
            );
          else done();
        },
      ),
    );
  } else previous.kill("SIGTERM");
  await exited;
}
function start() {
  if (closing) return;
  const next = spawn(
    process.execPath,
    [resolve(root, "scripts/dev-worker.mjs"), ...process.argv.slice(2)],
    { cwd: root, stdio: "inherit", windowsHide: true },
  );
  child = next;
  next.once("error", (error) => {
    console.error(error.message);
    void shutdown(1);
  });
  next.once("exit", (code) => {
    if (child === next && !closing) {
      if (!process.argv.includes("--check"))
        console.error(
          "Development process stopped. Fix the reported error and run npm run dev again.",
        );
      void shutdown(code ?? 1);
    }
  });
}
const queue = restartQueue(
  async () => {
    console.log(
      "Development configuration changed. Restarting with fresh settings…",
    );
    await stop();
    start();
  },
  {
    onError: (error) => {
      console.error(error.message);
      void shutdown(1);
    },
  },
);
let unwatch = () => {};
async function shutdown(code = 0) {
  if (closing) return;
  closing = true;
  unwatch();
  await queue.close();
  await stop();
  process.exitCode = code;
}
for (const signal of ["SIGINT", "SIGTERM"])
  process.on(signal, () => {
    void shutdown();
  });
if (!process.argv.includes("--check")) {
  unwatch = watchFiles(
    [
      "package.json",
      "package-lock.json",
      "apps/playground/package.json",
      "apps/playground/.env.local",
      "apps/playground/.env.example",
      "apps/playground/src/app.settings.json",
      "scripts/dev-worker.mjs",
      "scripts/local-database.mjs",
      "scripts/local-server.mjs",
      ...[
        "admin",
        "booking",
        "commerce",
        "content",
        "hospitality",
        "identity",
        "product",
      ].map((name) => `packages/${name}/package.json`),
    ].map((file) => resolve(root, file)),
    () => queue.request(),
  );
  console.log(
    "Watching: code and CSS use Vite hot reload; environment, package and startup changes restart automatically.",
  );
}
start();
