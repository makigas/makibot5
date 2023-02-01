import test from "node:test";
import assert from "node:assert";
import { KarmaBank } from "../../dist/manager.js";
import { KarmaAction } from "../../dist/model.js";
import { initDatabase } from "../../dist/index.js";

test("KarmaBank should count the bounties received today", async () => {
  await initDatabase(":memory:");

  const bank = new KarmaBank("12341234");
  assert.strictEqual(await bank.receivedToday(), 0);

  await KarmaAction.create({
    actorType: "Interaction",
    actorId: "1234",
    type: "bounty",
    originatorId: "20000",
    targetId: "12341234",
    amount: 50,
  });
  assert.strictEqual(await bank.receivedToday(), 50);

  await KarmaAction.create({
    actorType: "Interaction",
    actorId: "1235",
    type: "bounty",
    originatorId: "20000",
    targetId: "12341234",
    amount: 150,
  });
  assert.strictEqual(await bank.receivedToday(), 200);
});

test("KarmaBank should count the bounties sent today", async () => {
  await initDatabase(":memory:");

  const bank = new KarmaBank("12341234");
  assert.strictEqual(await bank.sentToday(), 0);

  await KarmaAction.create({
    actorType: "Interaction",
    actorId: "1234",
    type: "bounty",
    originatorId: "12341234",
    targetId: "12498071234",
    amount: 50,
  });
  assert.strictEqual(await bank.sentToday(), 50);

  await KarmaAction.create({
    actorType: "Interaction",
    actorId: "1235",
    type: "bounty",
    originatorId: "12341234",
    targetId: "09378450293",
    amount: 150,
  });
  assert.strictEqual(await bank.sentToday(), 200);
});

test("KarmaBank should allow sending bounties", async () => {
  await initDatabase(":memory:");
  const bank = new KarmaBank("12345678");

  const rowsBefore = await KarmaAction.count("*", {
    where: {
      actor_type: "Interaction",
      id: "444",
      originator_id: "12345678",
      target_id: "444",
      amount: 50,
    },
  });
  assert.strictEqual(0, rowsBefore);

  await bank.send({ type: "Interaction", id: "444" }, "555", 50);

  const rowsAfter = await KarmaAction.count("*", {
    where: {
      actor_type: "Interaction",
      id: "444",
      originator_id: "12345678",
      target_id: "444",
      amount: 50,
    },
  });
  assert.strictEqual(1, rowsAfter);
});

test("Should send points", async () => {
  await initDatabase(":memory:");
  const bank = new KarmaBank("12345678");
  await assert.doesNotReject(
    bank.send({ type: "Interaction", id: "555" }, "666", 1),
  );
});

test("Should not let you give points if you reached the sending limit for today", async () => {
  await initDatabase(":memory:");
  const bank = new KarmaBank("12345678");

  await bank.send({ type: "Interaction", id: "444" }, "555", 300);
  await assert.rejects(
    bank.send({ type: "Interaction", id: "555" }, "666", 1),
    /Sending limit exceeded for the day/,
  );
});

test("Should not let you give points if you would reach the sending limit for today", async () => {
  await initDatabase(":memory:");
  const bank = new KarmaBank("12345678");

  await bank.send({ type: "Interaction", id: "444" }, "555", 250);
  await assert.rejects(
    bank.send({ type: "Interaction", id: "555" }, "666", 51),
    /Sending limit exceeded for the day/,
  );
});

test("Should let me receive points", async () => {
  await initDatabase(":memory:");
  const bank = new KarmaBank("12345678");
  await assert.doesNotReject(
    bank.send({ type: "Interaction", id: "1" }, "200", 20),
  );

  const receiverBank = new KarmaBank("200");
  assert.strictEqual(await receiverBank.receivedToday(), 20);
});

test("Should not let me receive points if I received too much today", async () => {
  await initDatabase(":memory:");
  const thirdBank = new KarmaBank("1234");
  await thirdBank.send({ type: "Interaction", id: "1" }, "200", 300);

  const secondBank = new KarmaBank("23456");
  await assert.rejects(
    secondBank.send({ type: "Interaction", id: "2" }, "200", 1),
    /Receiving limit exceeded for the day/,
  );
});

test("Should not let me receive points if I would receive too much today", async () => {
  await initDatabase(":memory:");
  const thirdBank = new KarmaBank("1234");
  await thirdBank.send({ type: "Interaction", id: "1" }, "200", 250);

  const secondBank = new KarmaBank("23456");
  await assert.rejects(
    secondBank.send({ type: "Interaction", id: "2" }, "200", 51),
    /Receiving limit exceeded for the day/,
  );
});
