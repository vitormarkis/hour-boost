import { ApplicationError, DataOrError, PlanType, PlanUsage } from "core"

import { UserCompletedFarmSessionUsageCommand, UserHasStartFarmingCommand } from "~/application/commands"
import { EventEmitter, UserClusterEvents } from "~/application/services"
import {
  AccountStatusList,
  FarmService,
  FarmingAccountDetailsWithAccountName,
} from "~/application/services/FarmService"
import { Publisher } from "~/infra/queue"

export const FARMING_INTERVAL_IN_SECONDS = 1

export class FarmUsageService extends FarmService {
  type: PlanType = "USAGE"
  private FARMING_GAP = FARMING_INTERVAL_IN_SECONDS
  private farmingInterval: NodeJS.Timeout | undefined
  private usageLeft: number
  readonly initialUsageLeft: number
  readonly emitter: EventEmitter<UserClusterEvents>

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
      this.stopFarmAllAccounts()
    })
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

  publishCompleteFarmSession(): void {
    this.publisher.publish(
      new UserCompletedFarmSessionUsageCommand({
        farmingAccountDetails: this.getFarmingAccountDetails(),
        planId: this.planId,
        when: new Date(),
      })
    )
  }

  startFarm(): DataOrError<null> {
    this.status = "FARMING"
    if (this.usageLeft <= 0) {
      return [
        new ApplicationError(
          "Seu plano não possui mais uso disponível.",
          403,
          undefined,
          "PLAN_MAX_USAGE_EXCEEDED"
        ),
        null,
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

  stopFarm() {
    this.status = "IDDLE"
    this.accountsFarming.forEach(acc => {
      acc.status = "IDDLE"
    })
    this.publishCompleteFarmSession()
    clearInterval(this.farmingInterval)
  }

  pauseFarmOnAccount(accountName: string): void {
    if (this.getActiveFarmingAccountsAmount() === 1) {
      this.stopFarm()
    }
    this.setAccountStatus(accountName, "IDDLE")
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
