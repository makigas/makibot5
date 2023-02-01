import { Service } from "./private.js";

export interface ServerJoinService extends Service {
  onServerJoin(): Promise<void>;
}

export interface ServerLeaveService extends Service {
  onServerLeave(): Promise<void>;
}

export interface ServerBanService extends Service {
  onServerBan(): Promise<void>;
}

export type Contract = Service &
  Partial<ServerJoinService> &
  Partial<ServerLeaveService> &
  Partial<ServerBanService>;
