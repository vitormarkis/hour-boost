import { ApplicationError, PlanType, PlanUsage, Usage } from "core"

import { UserCompleteFarmSessionCommand, UserHasStartFarmingCommand } from "~/application/commands"
import { PlanUsageExpiredMidFarmCommand } from "~/application/commands/PlanUsageExpiredMidFarmCommand"
import { UserFarmedCommand } from "~/application/commands/UserFarmedCommand"
import { FarmServiceStatus, IFarmService } from "~/application/services"
import { Publisher } from "~/infra/queue"

export const FARMING_INTERVAL_IN_SECONDS = 1

type FarmingAccountDetails = {
  usageAmount: number
  status: "FARMING" | "IDDLE"
}

export class FarmUsageService implements IFarmService {
  private readonly publisher: Publisher
  readonly accountsFarming = new Map<string, FarmingAccountDetails>()

  FARMING_GAP = FARMING_INTERVAL_IN_SECONDS
  farmingInterval: NodeJS.Timeout | undefined
  status: FarmServiceStatus = "IDDLE"
  type: PlanType = "USAGE"
  readonly planId: string
  readonly ownerId: string
  readonly username: string
  private usageLeft: number
  readonly initialUsageLeft: number
  private startedAt: Date = new Date()

  constructor(publisher: Publisher, plan: PlanUsage, username: string) {
    if (!(plan instanceof PlanUsage))
      throw new ApplicationError("Tentativa de fazer usage farm com plano que não é do tipo USAGE.", 403)
    this.planId = plan.id_plan
    this.ownerId = plan.ownerId
    this.publisher = publisher
    this.username = username
    this.usageLeft = plan.getUsageLeft()
    this.initialUsageLeft = plan.getUsageLeft()
  }

  getUsageLeft() {
    return this.usageLeft
  }

  get hasAccounts() {
    return this.accountsFarming.size > 0
  }

  private addUsageToAccount(usageAmount: number) {
    this.accountsFarming.forEach(acc => {
      if (acc.status === "FARMING") acc.usageAmount += usageAmount
    })
  }

  getAccountDetails(accountName: string) {
    return this.accountsFarming.get(accountName) ?? null
  }

  private appendAccount(accountName: string) {
    this.accountsFarming.set(accountName, {
      usageAmount: 0,
      status: "FARMING",
    })
  }

  private setAccountStatus(accountName: string, status: "FARMING" | "IDDLE") {
    const account = this.getAccountDetails(accountName)
    if (!account)
      throw new ApplicationError("NSTH: Tried to resume farming on account that don't exists.", 500)
    account.status = status
  }

  resumeFarming(accountName: string) {
    this.setAccountStatus(accountName, "FARMING")
  }

  pauseFarmOnAccount(accountName: string) {
    this.setAccountStatus(accountName, "IDDLE")
  }

  private isAccountAdded(accountName: string) {
    return !!this.getAccountDetails(accountName)
  }

  farmWithAccount(accountName: string) {
    this.isAccountAdded(accountName) ? this.resumeFarming(accountName) : this.appendAccount(accountName)
  }

  getActiveFarmingAccounts() {
    return Array.from(this.accountsFarming).filter(([accountName, details]) => details.status === "FARMING")
  }

  getActiveFarmingAccountsAmount() {
    return this.getActiveFarmingAccounts().length
  }

  startFarm() {
    if (!this.hasAccounts)
      throw new ApplicationError("Você não pode começar uma sessão de farm sem uma conta atribuída.")
    this.status = "FARMING"
    this.startedAt = new Date()
    if (this.usageLeft <= 0) throw new ApplicationError("Seu plano não possui mais uso disponível.")
    this.farmingInterval = setInterval(() => {
      const amountFarmed = this.FARMING_GAP * this.getActiveFarmingAccountsAmount()
      const amountFarmedIndividually = this.FARMING_GAP

      if (this.usageLeft - amountFarmed < 0) {
        console.log("Publicando evento")
        this.publisher.publish(
          new PlanUsageExpiredMidFarmCommand({
            planId: this.planId,
            usages: this.getAccountsUsages().map(acc => acc.usage),
            userId: this.ownerId,
            when: new Date(),
            username: this.username,
          })
        )
        return this.stopFarmSetInternals()
      }
      // this.sharedUsageLeft.farm(this.FARMING_GAP)
      this.usageLeft -= amountFarmed
      this.addUsageToAccount(amountFarmedIndividually)
      this.publisher.publish(
        new UserFarmedCommand({ amount: this.FARMING_GAP, username: this.username, when: new Date() })
      )
      // no front, subtrair o valor farmedValue do usageLeft
    }, this.FARMING_GAP * 1000).unref()

    this.publisher.publish(
      new UserHasStartFarmingCommand({
        when: new Date(),
        planId: this.planId,
        userId: this.ownerId,
      })
    )
  }

  private stopFarmSetInternals() {
    this.status = "IDDLE"
    clearInterval(this.farmingInterval)
  }

  private getAccountsUsageAmount() {
    const accountNameAndTheirUsage: AccountNameAndTheirUsage[] = []
    this.accountsFarming.forEach(({ usageAmount }, accountName) => {
      accountNameAndTheirUsage.push({
        accountName,
        usageAmount,
      })
    })
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

  stopFarm() {
    this.stopFarmSetInternals()

    this.getAccountsUsages().forEach(acc => {
      this.publisher.publish(
        new UserCompleteFarmSessionCommand({
          planId: this.planId,
          usage: acc.usage,
          userId: this.ownerId,
          username: acc.accountName,
          when: new Date(),
          farmStartedAt: this.startedAt,
        })
      )
    })
  }
}

type AccountNameAndTheirUsage = {
  accountName: string
  usageAmount: number
}
