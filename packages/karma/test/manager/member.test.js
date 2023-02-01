import assert from "node:assert";
import test from "node:test";
import { MemberKarma } from "../../dist/manager.js";
import { initDatabase } from "../../dist/index.js";

test("insert and destroy flow", async () => {
  await initDatabase(":memory:");

  const manager = new MemberKarma("1234790487");
  assert.strictEqual(0, await manager.count());
  await manager.action({
    actor: {
      id: "1234",
      type: "Message",
    },
    kind: "message",
    originatorId: "123456",
  });
  assert.strictEqual(1, await manager.count());
  await manager.action({
    actor: {
      id: "1235",
      type: "Message",
    },
    kind: "heart",
    originatorId: "123456",
  });
  assert.strictEqual(4, await manager.count());

  await manager.undo({
    actor: {
      id: "1234",
      type: "Message",
    },
    kind: "message",
    originatorId: "123456",
  });
  assert.strictEqual(3, await manager.count());
});
