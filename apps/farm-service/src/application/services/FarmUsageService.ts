import { ApplicationError, DataOrError, PlanType, PlanUsage, Usage } from "core"

import { UserCompleteFarmSessionCommand, UserHasStartFarmingCommand } from "~/application/commands"
import { EventEmitter, UserClusterEvents } from "~/application/services"
import {
  AccountStatusList,
  FarmService,
  NSFarmService,
  PauseFarmOnAccountUsage,
} from "~/application/services/FarmService"
import { Publisher } from "~/infra/queue"
import { UsageBuilder } from "~/utils/builders/UsageBuilder"

export const FARMING_INTERVAL_IN_SECONDS = 1

export type FarmingAccountDetails = {
  usageAmountInSeconds: number
  status: AccountFarmingStatus
}
type AccountFarmingStatus = "FARMING" | "IDDLE"

export type FarmingAccountDetailsWithAccountName = FarmingAccountDetails & {
  accountName: string
}

export class FarmUsageService extends FarmService {
  readonly accountsFarming = new Map<string, FarmingAccountDetails>()
  type: PlanType = "USAGE"
  private FARMING_GAP = FARMING_INTERVAL_IN_SECONDS
  private farmingInterval: NodeJS.Timeout | undefined
  private usageLeft: number
  readonly initialUsageLeft: number
  readonly emitter: EventEmitter<UserClusterEvents>
  readonly usageBuilder = new UsageBuilder()

  constructor(props: FarmUsageServiceProps) {
    super({
      planId: props.plan.id_plan,
      startedAt: props.now,
      userId: props.plan.ownerId,
      username: props.username,
      publisher: props.publisher,
    })
    this.usageLeft = props.plan.getUsageLeft()
    this.initialUsageLeft = props.plan.getUsageLeft()
    this.emitter = props.emitter

    this.emitter.on("service:max-usage-exceeded", () => {
      console.log("1. ouviu `service:max-usage-exceeded`: chamando stopFarmAllAccounts")
      this.stopFarmAllAccounts({ killSession: true })
    })
  }

  getAccountDetails(accountName: string) {
    return this.accountsFarming.get(accountName) ?? null
  }

  protected resumeFarming(accountName: string) {
    this.setAccountStatus(accountName, "FARMING")
  }

  isAccountAdded(accountName: string) {
    return !!this.getAccountDetails(accountName)
  }

  getActiveFarmingAccountsAmount() {
    return this.getActiveFarmingAccounts().length
  }

  hasAccountsFarming(): boolean {
    return this.getActiveFarmingAccountsAmount() > 0
  }

  getFarmingAccounts(): DataOrError<NSFarmService.GetFarmingAccounts> {
    let accountStatus = {} as NSFarmService.GetFarmingAccounts
    for (const [accountName, details] of this.accountsFarming) {
      accountStatus[accountName] = details.status
    }

    return [null, accountStatus]
  }

  private getActiveFarmingAccounts() {
    const res = Array.from(this.accountsFarming).filter(([_, details]) => details.status === "FARMING")
    return res
  }

  farmWithAccount(accountName: string): DataOrError<null> {
    const [error] = this.farmWithAccountImpl(accountName)
    if (error) return [error]

    console.log(`farm-service: is ${accountName} added? `, this.isAccountAdded(accountName))
    if (!this.isAccountAdded(accountName)) {
      console.log(
        `Since the ${accountName} is not added, I'm appending this account again with the status 'FARMING'`
      )
    }
    if (this.isAccountAdded(accountName)) this.resumeFarming(accountName)
    else this.appendAccount(accountName)
    return [null, null]
  }

  protected appendAccount(accountName: string) {
    this.accountsFarming.set(accountName, {
      usageAmountInSeconds: 0,
      status: "FARMING",
    })
  }

  private setAccountStatus(accountName: string, status: "FARMING" | "IDDLE") {
    const account = this.getAccountDetails(accountName)
    if (!account) return
    // if (!account) {
    //   const msg = `NSTH: Tried to resume farming on account that don't exists. ${accountName}`
    //   throw new ApplicationError(msg, 500)
    // }
    this.accountsFarming.set(accountName, {
      ...account,
      status,
    })

    // account = {
    //   ...account,
    //   status,
    // }
  }

  private stopFarmImpl() {
    const when = new Date()
    this.status = "IDDLE"
    this.accountsFarming.forEach(acc => {
      acc.status = "IDDLE"
    })
    const usages = this.getFarmingAccountDetails().map(accountDetails => {
      return this.usageBuilder.create({
        accountName: accountDetails.accountName,
        amountTime: accountDetails.usageAmountInSeconds,
        createdAt: when,
        plan_id: this.planId,
      })
    })
    clearInterval(this.farmingInterval)
    return { usages }
  }

  protected stopFarm(killSession: boolean): void {
    const { usages } = this.stopFarmImpl()
    this.publishCompleteFarmSession(
      {
        type: "STOP-ALL",
        usages,
        accountNameList: this.getFarmingAccountsNameList(),
      },
      killSession
    )
    clearInterval(this.farmingInterval)
  }

  protected stopFarmSync(): Usage[] {
    const { usages } = this.stopFarmImpl()
    return usages
  }

  isAccountFarming(accountName: string): boolean {
    const acc = this.accountsFarming.get(accountName)
    return !!(acc?.status === "FARMING")
  }

  pauseFarmOnAccountSync(accountName: string): DataOrError<PauseFarmOnAccountUsage> {
    if (this.getActiveFarmingAccountsAmount() === 1) {
      const usages = this.stopFarmSync()
      return [null, { type: "STOP-ALL", usages, accountNameList: this.getFarmingAccountsNameList() }]
    }
    this.setAccountStatus(accountName, "IDDLE")
    return [null, { type: "STOP-SILENTLY", accountName }]
  }

  private getFarmingAccountDetails(): FarmingAccountDetailsWithAccountName[] {
    const farmingAccountDetails = [] as FarmingAccountDetailsWithAccountName[]
    for (const [accountName, details] of this.accountsFarming) {
      farmingAccountDetails.push({
        accountName,
        usageAmountInSeconds: details.usageAmountInSeconds,
        status: details.status,
      })
    }
    return farmingAccountDetails
  }

  pauseFarmOnAccount(accountName: string, killSession: boolean): DataOrError<null> {
    if (this.getActiveFarmingAccountsAmount() === 1) {
      this.stopFarm(killSession)
    }
    this.setAccountStatus(accountName, "IDDLE")
    return [null, null]
  }

  publishCompleteFarmSession(pauseFarmCategory: PauseFarmOnAccountUsage, killSession: boolean): void {
    this.publisher.publish(
      new UserCompleteFarmSessionCommand({
        pauseFarmCategory,
        planId: this.planId,
        when: new Date(),
        killSession,
      })
    )
  }

  protected getFarmingAccountsNameList(): string[] {
    return Array.from(this.accountsFarming.keys())
  }

  startFarm(): DataOrError<null> {
    this.status = "FARMING"
    if (this.usageLeft <= 0) {
      return [
        new ApplicationError(
          "Seu plano não possui mais uso disponível.",
          403,
          { accountName: this.username },
          "PLAN_MAX_USAGE_EXCEEDED"
        ),
      ]
    }
    this.farmingInterval = setInterval(() => {
      const allAccountsFarmedTotalAmount = this.FARMING_GAP * this.getActiveFarmingAccountsAmount()
      const individualAccountFarmedAmount = this.FARMING_GAP

      if (this.usageLeft - allAccountsFarmedTotalAmount < 0) {
        this.emitter.emit("service:max-usage-exceeded")
        clearInterval(this.farmingInterval)
        return
      }
      // this.sharedUsageLeft.farm(this.FARMING_GAP)
      this.usageLeft -= allAccountsFarmedTotalAmount
      this.addUsageToAccount(individualAccountFarmedAmount)
    }, this.FARMING_GAP * 1000).unref()

    this.publisher.publish(
      new UserHasStartFarmingCommand({
        when: new Date(),
        planId: this.planId,
        userId: this.userId,
      })
    )

    return [null, null]
  }

  getUsageLeft() {
    return this.usageLeft
  }

  getAccountsStatus(): AccountStatusList {
    let accountStatus: AccountStatusList = {}
    for (const [accountName, details] of this.accountsFarming) {
      accountStatus[accountName] = details.status
    }
    return accountStatus
  }

  farmWithAccountImpl(accountName: string): DataOrError<null> {
    if (this.getActiveFarmingAccountsAmount() === 0) {
      this.publisher.publish(
        new UserHasStartFarmingCommand({
          planId: this.planId,
          userId: this.userId,
          when: new Date(),
        })
      )
      return this.startFarm()
    }
    return [null, null]
  }

  private addUsageToAccount(usageAmount: number) {
    for (const [_, acc] of this.accountsFarming) {
      if (acc.status === "FARMING") acc.usageAmountInSeconds += usageAmount
    }
  }
}

type FarmUsageServiceProps = {
  publisher: Publisher
  plan: PlanUsage
  username: string
  now: Date
  emitter: EventEmitter<UserClusterEvents>
}
