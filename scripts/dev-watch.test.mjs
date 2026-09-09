import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, writeFile, rename, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { setTimeout as delay } from "node:timers/promises";
import { restartQueue, watchFiles } from "./dev-watch.mjs";

test("change bursts coalesce and a change during restart never overlaps workers", async () => {
  let calls = 0,
    active = 0,
    peak = 0,
    release;
  const firstStarted = Promise.withResolvers();
  const first = new Promise((done) => {
    release = done;
  });
  const secondStarted = Promise.withResolvers();
  const queue = restartQueue(
    async () => {
      calls++;
      active++;
      peak = Math.max(peak, active);
      if (calls === 1) {
        firstStarted.resolve();
        await first;
      } else secondStarted.resolve();
      active--;
    },
    { delay: 10 },
  );
  queue.request();
  queue.request();
  queue.request();
  await firstStarted.promise;
  queue.request();
  queue.request();
  await delay(30);
  assert.equal(calls, 1);
  release();
  await secondStarted.promise;
  await queue.close();
  assert.equal(calls, 2);
  assert.equal(peak, 1);
  queue.request();
  await delay(30);
  assert.equal(calls, 2);
});

test("file watcher handles atomic saves and ignores unrelated source changes", async () => {
  const directory = await mkdtemp(join(tmpdir(), "nsheth-watch-"));
  const changed = Promise.withResolvers();
  const names = [];
  const close = watchFiles([join(directory, ".env.local")], (name) => {
    names.push(name);
    changed.resolve();
  });
  try {
    await writeFile(join(directory, "component.tsx"), "source handled by Vite");
    await writeFile(join(directory, "temporary-env"), "temporary test fixture");
    await rename(
      join(directory, "temporary-env"),
      join(directory, ".env.local"),
    );
    await changed.promise;
    assert.ok(names.length > 0);
    assert.ok(names.every((name) => name === ".env.local"));
  } finally {
    close();
    await rm(directory, { recursive: true });
  }
});
