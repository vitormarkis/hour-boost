const log = console.log

import { DataOrError, DataOrFail, Fail, PlanType, Usage } from "core"
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

  abstract checkIfCanFarm(): DataOrFail<Fail>

  abstract getActiveFarmingAccountsAmount(): number
  abstract getFarmingAccounts(): DataOrError<NSFarmService.GetFarmingAccounts>
  abstract isAccountFarming(accountName: string): boolean
  abstract isAccountAdded(accountName: string): boolean
  abstract hasAccountsFarming(): boolean
  abstract farmWithAccount(accountName: string): DataOrFail<Fail>
  abstract farmWithAccountImpl(accountName: string): DataOrFail<Fail>

  getServiceStatus() {
    return this.status
  }

  stopFarmAllAccounts({ killSession }: { killSession: boolean }) {
    this.stopFarm(killSession)
  }

  protected abstract publishCompleteFarmSession(
    pauseFarmCategory: PauseFarmOnAccountUsage,
    killSession: boolean
  ): void

  protected abstract getFarmingAccountsNameList(): string[]
  protected abstract startFarm(): DataOrFail<Fail>
  protected abstract stopFarm(killSession: boolean): void
  protected abstract stopFarmSync(): Usage[]
  abstract pauseFarmOnAccount(accountName: string, killSession: boolean): DataOrError<null>
  abstract pauseFarmOnAccountSync(
    accountName: string,
    killSession: boolean
  ): DataOrError<PauseFarmOnAccountUsage>

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
    accountName: string
  }
  export type StopAll = {
    type: "STOP-ALL"
    usages: Usage[]
    accountNameList: string[]
  }
  export type StopOne = {
    type: "STOP-ONE"
    usage: Usage
    accountName: string
  }
}

export namespace NSFarmService {
  export type AccounStatus = "IDDLE" | "FARMING"
  export type GetFarmingAccounts = Record<string, AccounStatus>
}
