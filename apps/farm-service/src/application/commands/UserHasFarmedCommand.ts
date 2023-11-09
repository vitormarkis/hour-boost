import { EventNames } from "../../domain/service/UserFarmService"

export class UserHasFarmedCommand {
  name: EventNames = "user-has-farmed"

  constructor(
    readonly props: {
      id_user: string
      username: string
      usageLeft: number
      planId: string
    }
  ) {}
}
