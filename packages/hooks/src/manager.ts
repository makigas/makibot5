import { Service } from "./private.js";
import {
  Contract,
  ServerBanService,
  ServerLeaveService,
  ServerJoinService,
} from "./service.js";

export class ServiceManager {
  private readonly registry: { [k: string]: Contract } = {};

  registerService(h: Contract) {
    if (this.registry[h.name]) {
      throw new Error("Hook already registered");
    }
    this.registry[h.name] = h;
  }

  async onServerLeave(): Promise<void> {
    const joins: ServerLeaveService[] =
      this.filterServicesByImplementation("onServerLeave");
    await Promise.allSettled(joins.map((j) => j.onServerLeave()));
  }

  async onServerJoin(): Promise<void> {
    const joins: ServerJoinService[] =
      this.filterServicesByImplementation("onServerJoin");
    await Promise.allSettled(joins.map((j) => j.onServerJoin()));
  }

  async onServerBan(): Promise<void> {
    const joins: ServerBanService[] =
      this.filterServicesByImplementation("onServerBan");
    await Promise.allSettled(joins.map((j) => j.onServerBan()));
  }

  private filterServicesByImplementation<T extends Service>(
    name: keyof Contract,
  ): T[] {
    return Object.values(this.registry).filter((s) => !!s[name]) as T[];
  }
}
