import test from "node:test";
import { mock } from "node:test";
import assert from "node:assert";

import { ServiceManager } from "../dist/manager.js";

test("HookManager", async (t) => {
  await t.test("registers a hook", () => {
    const dummy = {
      name: "dummy",
    };
    const manager = new ServiceManager();
    assert.doesNotThrow(() => manager.registerService(dummy));
  });

  await t.test("fails if a hook is registered twice", () => {
    const dummy1 = { name: "dummy" };
    const dummy2 = { name: "dummy" };
    const manager = new ServiceManager();
    manager.registerService(dummy1);
    assert.throws(
      () => manager.registerService(dummy2),
      /Hook already registered/,
    );
  });

  await t.test(
    "can execute services that have a valid implementation",
    async () => {
      const service = {
        name: "dummy",
        onServerJoin: mock.fn(),
      };
      const manager = new ServiceManager();
      manager.registerService(service);
      await manager.onServerJoin();
      assert.strictEqual(1, service.onServerJoin.mock.calls.length);
    },
  );
});
