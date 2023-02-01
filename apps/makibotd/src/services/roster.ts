import { ServerJoinService, ServerLeaveService } from "@makigas/makibot-hooks";

export default class RosterService
  implements ServerJoinService, ServerLeaveService
{
  name = "roster";

  async onServerJoin(): Promise<void> {
    console.log("join");
  }

  async onServerLeave(): Promise<void> {
    console.log("leave");
  }
}
