import { ApplicationError, PlanType, PlanUsage, Usage } from "core"

import { UserHasStartFarmingCommand } from "~/application/commands"
import { UserCompletedFarmSessionUsageCommand } from "~/application/commands/UserCompletedFarmSessionUsageCommand"
import { EventEmitter, UserClusterEvents } from "~/application/services"
import { FarmService, FarmingAccountDetailsWithAccountName } from "~/application/services/FarmService"
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

  protected startFarmImpl(): void {
    if (this.usageLeft <= 0) throw new ApplicationError("Seu plano não possui mais uso disponível.", 403)
    this.farmingInterval = setInterval(() => {
      const allAccountsFarmedTotalAmount = this.FARMING_GAP * this.getActiveFarmingAccountsAmount()
      const individualAccountFarmedAmount = this.FARMING_GAP

      if (this.usageLeft - allAccountsFarmedTotalAmount < 0) {
        this.emitter.emit("service:max-usage-exceeded")
        // this.publisher.publish(
        //   new PlanUsageExpiredMidFarmCommand({
        //     planId: this.planId,
        //     usages: this.getAccountsUsages().map(acc => acc.usage),
        //     userId: this.userId,
        //     when: new Date(),
        //     username: this.username,
        //   })
        // )
        return this.stopFarmSetInternals()
      }
      // this.sharedUsageLeft.farm(this.FARMING_GAP)
      this.usageLeft -= allAccountsFarmedTotalAmount
      this.addUsageToAccount(individualAccountFarmedAmount)
      // this.publisher.publish(
      //   new UserFarmedCommand({
      //     amount: this.FARMING_GAP,
      //     username: this.username,
      //     when: new Date(),
      //   })
      // )
      // no front, subtrair o valor farmedValue do usageLeft
    }, this.FARMING_GAP * 1000).unref()

    this.publisher.publish(
      new UserHasStartFarmingCommand({
        when: new Date(),
        planId: this.planId,
        userId: this.userId,
      })
    )
  }

  protected stopFarmImpl(): void {
    this.stopFarmSetInternals()

    for (const acc of this.getAccountsUsages()) {
      // this.publisher.publish(
      //   new UserCompleteFarmSessionCommand({
      //     planId: this.planId,
      //     usage: acc.usage,
      //     userId: this.userId,
      //     username: acc.accountName,
      //     when: new Date(),
      //     farmStartedAt: this.startedAt,
      //   })
      // )
    }
  }

  getUsageLeft() {
    return this.usageLeft
  }

  private addUsageToAccount(usageAmount: number) {
    for (const [_, acc] of this.accountsFarming.entries()) {
      if (acc.status === "FARMING") acc.usageAmountInSeconds += usageAmount
    }
  }

  private stopFarmSetInternals() {
    clearInterval(this.farmingInterval)
  }

  private getAccountsUsageAmount() {
    const accountNameAndTheirUsage: AccountNameAndTheirUsage[] = []
    for (const [accountName, { usageAmountInSeconds: usageAmount }] of this.accountsFarming.entries()) {
      accountNameAndTheirUsage.push({
        accountName,
        usageAmount,
      })
    }
    return accountNameAndTheirUsage
  }

  getAccountsUsages() {
    return this.getAccountsUsageAmount().map(acc => {
      return {
        accountName: acc.accountName,
        usage: Usage.create({
          amountTime: acc.usageAmount,
          createdAt: this.startedAt,
          plan_id: this.planId,
          accountName: acc.accountName,
        }),
      }
    })
  }
}

type AccountNameAndTheirUsage = {
  accountName: string
  usageAmount: number
}

type FarmUsageServiceProps = {
  publisher: Publisher
  plan: PlanUsage
  username: string
  now: Date
  emitter: EventEmitter<UserClusterEvents>
}
