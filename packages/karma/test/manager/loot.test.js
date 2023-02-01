import test from "node:test";
import assert from "node:assert";
import { KarmaLoot } from "../../dist/manager.js";
import { initDatabase } from "../../dist/index.js";
import { KarmaAction } from "../../dist/model.js";

const LOOTER_ID = "12341234";

test("lootedToday", async () => {
  await initDatabase(":memory:");

  const looter = new KarmaLoot(LOOTER_ID);
  assert.strictEqual(await looter.lootedToday(), false);

  await KarmaAction.create({
    actorId: "123456",
    actorType: "Interaction",
    amount: 1,
    originatorId: LOOTER_ID,
    targetId: LOOTER_ID,
    type: "loot",
    created_at: new Date(Date.now()),
  });
  assert.strictEqual(await looter.lootedToday(), true);
});

test("yesterday", async () => {
  await initDatabase(":memory:");

  const looter = new KarmaLoot(LOOTER_ID);
  assert.strictEqual(await looter.yesterday(), 0);
  await KarmaAction.create({
    actorId: "123456",
    actorType: "Interaction",
    amount: 5,
    originatorId: LOOTER_ID,
    targetId: LOOTER_ID,
    type: "loot",
    created_at: new Date(Date.now() - 86400000),
  });
  assert.strictEqual(await looter.yesterday(), 5);
});

test("loot", async () => {
  await initDatabase(":memory:");

  const looter = new KarmaLoot(LOOTER_ID);
  await assert.doesNotReject(looter.loot({ type: "Interaction", id: 1234 }));

  await assert.rejects(
    looter.loot({ type: "Interaction", id: 1234 }),
    /You have already looted today/,
  );
});
