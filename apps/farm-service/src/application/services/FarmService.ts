import { ApplicationError, PlanType } from "core"
import { FarmServiceStatus } from "~/application/services"

type AccountFarmingStatus = "FARMING" | "IDDLE"

export type FarmingAccountDetails = {
  usageAmountInSeconds: number
  status: AccountFarmingStatus
}

export type FarmServiceProps = {
  startedAt: Date
  planId: string
  userId: string
  username: string
}

export abstract class FarmService {
  protected readonly accountsFarming = new Map<string, FarmingAccountDetails>()
  abstract readonly type: PlanType
  protected status: FarmServiceStatus
  protected readonly startedAt: Date
  protected readonly planId: string
  protected readonly userId: string
  protected readonly username: string

  constructor(props: FarmServiceProps) {
    this.status = "IDDLE"
    this.startedAt = props.startedAt
    this.planId = props.planId
    this.userId = props.userId
    this.username = props.username
  }

  getAccountDetails(accountName: string) {
    return this.accountsFarming.get(accountName) ?? null
  }

  private setAccountStatus(accountName: string, status: "FARMING" | "IDDLE") {
    const account = this.getAccountDetails(accountName)
    if (!account)
      throw new ApplicationError("NSTH: Tried to resume farming on account that don't exists.", 500)
    account.status = status
  }

  private appendAccount(accountName: string) {
    this.accountsFarming.set(accountName, {
      usageAmountInSeconds: 0,
      status: "FARMING",
    })
  }

  private resumeFarming(accountName: string) {
    this.setAccountStatus(accountName, "FARMING")
  }

  private isAccountAdded(accountName: string) {
    return !!this.getAccountDetails(accountName)
  }

  farmWithAccount(accountName: string): void {
    if (this.getActiveFarmingAccountsAmount() === 0) {
      this.startFarm()
    }
    this.isAccountAdded(accountName) ? this.resumeFarming(accountName) : this.appendAccount(accountName)
  }

  pauseFarmOnAccount(accountName: string): void {
    if (this.getActiveFarmingAccountsAmount() === 1) {
      this.stopFarm()
    }
    this.setAccountStatus(accountName, "IDDLE")
  }

  getServiceStatus() {
    return this.status
  }

  protected startFarm(): void {
    this.status = "FARMING"
    return this.startFarmImpl()
  }

  protected stopFarm(): void {
    this.status = "IDDLE"
    return this.stopFarmImpl()
  }

  protected abstract startFarmImpl(): void
  protected abstract stopFarmImpl(): void

  private getActiveFarmingAccounts() {
    return Array.from(this.accountsFarming).filter(([_, details]) => details.status === "FARMING")
  }

  getActiveFarmingAccountsAmount() {
    return this.getActiveFarmingAccounts().length
  }

  hasAccountsFarming(): boolean {
    return this.getActiveFarmingAccountsAmount() > 0
  }

  getFarmingAccounts() {
    const farmingAccounts: Record<string, AccountFarmingStatus> = {}
    for (const [accountName, details] of this.accountsFarming) {
      farmingAccounts[accountName] = details.status
    }
    return farmingAccounts
  }

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