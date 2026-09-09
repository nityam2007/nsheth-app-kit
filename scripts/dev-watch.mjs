import { watch } from "node:fs";
import { dirname, basename } from "node:path";

// Serial restarts: a burst of atomic saves causes one restart; a later change
// during startup gets one follow-up restart, never two overlapping servers.
export function restartQueue(
  restart,
  { delay = 350, onError = console.error } = {},
) {
  let timer,
    running,
    requested = false,
    closed = false;
  async function drain() {
    if (running || closed) return;
    running = (async () => {
      while (requested && !closed) {
        requested = false;
        try {
          await restart();
        } catch (error) {
          onError(error);
        }
      }
    })();
    await running;
    running = undefined;
  }
  return {
    request() {
      if (closed) return;
      clearTimeout(timer);
      timer = setTimeout(() => {
        requested = true;
        void drain();
      }, delay);
    },
    async close() {
      closed = true;
      clearTimeout(timer);
      await running;
    },
  };
}

export function watchFiles(files, changed) {
  const directories = new Map();
  for (const file of files) {
    const dir = dirname(file);
    if (!directories.has(dir)) directories.set(dir, new Set());
    directories.get(dir).add(basename(file));
  }
  const watchers = [];
  try {
    for (const [dir, names] of directories)
      watchers.push(
        watch(dir, (_event, filename) => {
          if (filename && names.has(String(filename)))
            changed(String(filename));
        }),
      );
  } catch (error) {
    for (const watcher of watchers) watcher.close();
    throw error;
  }
  return () => {
    for (const watcher of watchers) watcher.close();
  };
}
