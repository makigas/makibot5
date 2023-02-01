import { Snowflake } from "discord.js";
import { Op } from "sequelize";
import { KarmaAction } from "./model.js";

function startOfYesterday() {
  const date = new Date(Date.now() - 86400000);
  date.setUTCHours(0, 0, 0, 0);
  return date;
}

function startOfDay() {
  const date = new Date();
  date.setUTCHours(0, 0, 0, 0);
  return date;
}

type ActionType =
  | "message"
  | "upvote"
  | "downvote"
  | "star"
  | "heart"
  | "loots"
  | "wave";

const pointMapping: Record<ActionType, number> = {
  downvote: -1,
  heart: 3,
  loots: 1,
  message: 1,
  star: 3,
  upvote: 1,
  wave: 3,
};

interface CountOptions {
  kind: ActionType;
}

interface ActorInterface {
  type: string;
  id: Snowflake;
}

interface ActionOptions {
  /** The thing that cause karma to be processed (the message) */
  actor: ActorInterface;

  /** The person that triggers giving karma (the one who reacts, the one who sends the message...) */
  originatorId: Snowflake;
  kind: ActionType;
}

interface UndoActionOptions {
  actor: ActorInterface;
  originatorId: Snowflake;
  kind: ActionType;
}

export class KarmaLoot {
  constructor(private readonly member: Snowflake) {}

  async yesterday(): Promise<number> {
    const entry = await KarmaAction.findOne({
      where: {
        type: "loot",
        targetId: this.member,
        created_at: {
          [Op.gte]: startOfYesterday(),
          [Op.lt]: startOfDay(),
        },
      },
    });
    if (entry) {
      return entry.getDataValue("amount");
    }
    return 0;
  }

  async lootedToday(): Promise<boolean> {
    const count = await KarmaAction.count({
      where: {
        type: "loot",
        targetId: this.member,
        created_at: {
          [Op.gte]: startOfDay(),
        },
      },
    });
    return count > 0;
  }

  async loot(transaction: ActorInterface): Promise<void> {
    if (await this.lootedToday()) {
      throw new Error("You have already looted today");
    }
    const yesterday = await this.yesterday();
    await KarmaAction.create({
      type: "loot",
      targetId: this.member,
      originatorId: this.member,
      amount: yesterday + 1,
      actorType: transaction.type,
      actorId: transaction.id,
    });
  }
}

export class KarmaBank {
  constructor(private readonly member: Snowflake) {}

  private async checkReceived(receiver: Snowflake) {
    const total = await KarmaAction.sum("amount", {
      where: {
        type: "bounty",
        targetId: receiver,
        created_at: {
          [Op.gte]: startOfDay(),
        },
      },
    });
    return total || 0;
  }

  receivedToday(): Promise<number> {
    return this.checkReceived(this.member);
  }

  async sentToday(): Promise<number> {
    const total = await KarmaAction.sum("amount", {
      where: {
        type: "bounty",
        originatorId: this.member,
        created_at: {
          [Op.gte]: startOfDay(),
        },
      },
    });
    return total || 0;
  }

  async send(
    transaction: ActorInterface,
    target: Snowflake,
    amount: number,
  ): Promise<void> {
    const sentToday = await this.sentToday();
    if (sentToday + amount > 300) {
      throw new Error("Sending limit exceeded for the day");
    }

    const receivedToday = await this.checkReceived(target);
    if (receivedToday + amount > 300) {
      throw new Error("Receiving limit exceeded for the day");
    }

    await KarmaAction.create({
      actorType: transaction.type,
      actorId: transaction.id,
      type: "bounty",
      originatorId: this.member,
      targetId: target,
      amount,
    });
  }
}

export class MemberKarma {
  /**
   * @param target the account whose karma we are interacting with.
   */
  constructor(private readonly target: Snowflake) {}

  async action(options: ActionOptions): Promise<void> {
    await KarmaAction.create({
      actorType: options.actor.type,
      actorId: options.actor.id,
      type: options.kind,
      originatorId: options.originatorId,
      amount: pointMapping[options.kind],
      targetId: this.target,
    });
  }

  async count(options?: CountOptions): Promise<number> {
    const whereConditions: Partial<KarmaAction> = {};
    if (options && options.kind) {
      whereConditions.type = options.kind;
    }
    return (
      (await KarmaAction.sum("amount", {
        where: whereConditions,
      })) || 0
    );
  }

  async undo(options: UndoActionOptions): Promise<void> {
    await KarmaAction.destroy({
      where: {
        actorType: options.actor.type,
        actorId: options.actor.id,
        type: options.kind,
        originatorId: options.originatorId,
        targetId: this.target,
      },
    });
  }
}
