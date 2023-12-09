import { ApplicationError, PlanType, User } from "core"
import { UserHasStartFarmingCommand, UserPauseInfinityFarmSessionCommand } from "~/application/commands"
import { FarmServiceStatus, FarmingAccountDetails, IFarmService } from "~/application/services"
import { Publisher } from "~/infra/queue"

export class FarmInfinityService implements IFarmService {
  readonly accountsFarming = new Map<string, FarmingAccountDetails>()
  type: PlanType = "INFINITY"
  status: FarmServiceStatus = "IDDLE"

  constructor(
    private readonly publisher: Publisher,
    readonly planId: string,
    readonly ownerId: string
  ) { }

  private setAccountStatus(accountName: string, status: "FARMING" | "IDDLE") {
    const account = this.getAccountDetails(accountName)
    if (!account)
      throw new ApplicationError("NSTH: Tried to resume farming on account that don't exists.", 500)
    account.status = status
  }

  // iguais
  pauseFarmOnAccount(accountName: string) {
    this.setAccountStatus(accountName, "IDDLE")
  }

  // iguais
  appendAccount(accountName: string) {
    this.accountsFarming.set(accountName, {
      usageAmountInSeconds: 0,
      status: "FARMING",
    })
  }

  // iguais
  resumeFarming(accountName: string) {
    this.setAccountStatus(accountName, "FARMING")
  }

  // iguais
  getAccountDetails(accountName: string) {
    return this.accountsFarming.get(accountName) ?? null
  }

  // iguais
  private isAccountAdded(accountName: string) {
    return !!this.getAccountDetails(accountName)
  }

  // iguais
  farmWithAccount(accountName: string) {
    this.isAccountAdded(accountName) ? this.resumeFarming(accountName) : this.appendAccount(accountName)
  }


  // iguais
  getActiveFarmingAccounts() {
    return Array.from(this.accountsFarming).filter(([accountName, details]) => details.status === "FARMING")
  }

  // iguais
  getActiveFarmingAccountsAmount() {
    return this.getActiveFarmingAccounts().length
  }

  // iguais
  hasAccountsFarming() {
    return this.getActiveFarmingAccountsAmount() > 0
  }

  async startFarm(): Promise<void> {
    this.status = "FARMING"
    this.publisher.publish(
      new UserHasStartFarmingCommand({
        planId: this.planId,
        userId: this.ownerId,
        when: new Date(),
      })
    )
  }

  async stopFarm(): Promise<void> {
    this.status = "IDDLE"
    this.publisher.publish(
      new UserPauseInfinityFarmSessionCommand({
        when: new Date(),
      })
    )
  }
}
