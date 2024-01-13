const log = console.log

import { DataOrError, PlanType, Usage } from "core"
import { FarmServiceStatus } from "~/application/services"
import { Publisher } from "~/infra/queue"

export type FarmServiceProps = {
  startedAt: Date
  planId: string
  userId: string
  username: string
  publisher: Publisher
}

export abstract class FarmService {
  protected readonly publisher: Publisher
  abstract readonly type: PlanType
  protected status: FarmServiceStatus
  protected readonly planId: string
  protected readonly userId: string
  protected readonly username: string
  readonly startedAt: Date

  constructor(props: FarmServiceProps) {
    this.status = "IDDLE"
    this.startedAt = props.startedAt
    this.planId = props.planId
    this.userId = props.userId
    this.username = props.username
    this.publisher = props.publisher
  }

  abstract getAccountsStatus(): AccountStatusList

  abstract getActiveFarmingAccountsAmount(): number
  abstract getFarmingAccounts(): DataOrError<NSFarmService.GetFarmingAccounts>
  abstract isAccountFarming(accountName: string): boolean
  abstract isAccountAdded(accountName: string): boolean
  abstract hasAccountsFarming(): boolean
  abstract farmWithAccount(accountName: string): DataOrError<null>
  abstract farmWithAccountImpl(accountName: string): DataOrError<null>

  getServiceStatus() {
    return this.status
  }

  stopFarmAllAccounts() {
    this.stopFarm()
  }

  protected abstract publishCompleteFarmSession(pauseFarmCategory: PauseFarmOnAccountUsage): void

  protected abstract startFarm(): DataOrError<null>
  protected abstract stopFarm(): void
  protected abstract stopFarmSync(): Usage[]
  abstract pauseFarmOnAccount(accountName: string): DataOrError<null>
  abstract pauseFarmOnAccountSync(accountName: string): DataOrError<PauseFarmOnAccountUsage>

  getPlanId() {
    return this.planId
  }

  getUserId() {
    return this.userId
  }

  getUsername() {
    return this.username
  }
}

export type AccountStatusList = Record<string, "IDDLE" | "FARMING">

export type PauseFarmOnAccountUsage =
  | NSFarmSessionCategory.StopSilently
  | NSFarmSessionCategory.StopAll
  | NSFarmSessionCategory.StopOne

export namespace NSFarmSessionCategory {
  export type StopSilently = {
    type: "STOP-SILENTLY"
  }
  export type StopAll = {
    type: "STOP-ALL"
    usages: Usage[]
  }
  export type StopOne = {
    type: "STOP-ONE"
    usage: Usage
  }
}

export namespace NSFarmService {
  export type AccounStatus = "IDDLE" | "FARMING"
  export type GetFarmingAccounts = Record<string, AccounStatus>
}
