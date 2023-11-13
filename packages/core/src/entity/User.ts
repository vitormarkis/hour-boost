import { GuestPlan, PlanInfinity, PlanUsage } from "../entity/plan"
import { Plan } from "./plan/Plan"
import { Purchase } from "./Purchase"
import { Role } from "./role/Role"
import { UserRole } from "./role/UserRole"
import { ActiveStatus } from "./status/ActiveStatus"
import { Status, StatusName } from "./status/Status"
import { SteamAccount } from "./SteamAccount"

export class User {
  readonly id_user: string
  readonly email: string
  readonly username: string
  readonly profilePic: string
  readonly steamAccounts: SteamAccount[]
  plan: PlanUsage | PlanInfinity
  readonly role: Role
  readonly status: Status
  readonly purchases: Purchase[]

  private constructor(props: UserProps) {
    this.id_user = props.id_user
    this.email = props.email
    this.username = props.username
    this.profilePic = props.profilePic
    this.steamAccounts = props.steamAccounts
    this.plan = props.plan
    this.role = props.role
    this.status = props.status
    this.purchases = props.purchases
  }

  static create(props: UserCreateProps) {
    return new User({
      ...props,
      profilePic: props.profilePic ?? "",
      plan: GuestPlan.create({
        ownerId: props.id_user,
      }),
      purchases: [],
      role: new UserRole(),
      status: new ActiveStatus(),
      steamAccounts: [],
    })
  }

  static restore(props: UserProps) {
    return new User(props)
  }

  assignPlan(plan: PlanUsage | PlanInfinity) {
    this.plan = plan
  }

  addSteamAccount(steamAccount: SteamAccount) {
    const currentUserSteamAccounts = this.steamAccounts.length
    if (currentUserSteamAccounts >= this.plan.maxSteamAccounts) {
      throw new Error("Max plan steam accounts reached.")
    }
    this.steamAccounts.push(steamAccount)
  }
}

type UserProps = {
  id_user: string
  email: string
  username: string
  profilePic: string
  steamAccounts: SteamAccount[]
  plan: PlanUsage | PlanInfinity
  role: Role
  status: Status
  purchases: Purchase[]
}

type UserCreateProps = {
  id_user: string
  email: string
  username: string
  profilePic?: string
}
