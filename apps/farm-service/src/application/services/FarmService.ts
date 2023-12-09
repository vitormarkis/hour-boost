import { ApplicationError, PlanType } from "core"
import { FarmServiceStatus, IFarmService } from "~/application/services"

type AccountFarmingStatus = "FARMING" | "IDDLE"

export type FarmingAccountDetails = {
  usageAmountInSeconds: number
  status: AccountFarmingStatus
}

type FarmServiceRootProps = {
  ownerId: string
}

export abstract class FarmService {
  private readonly accountsFarming = new Map<string, FarmingAccountDetails>()
  abstract readonly type: PlanType
  private status: FarmServiceStatus
  readonly ownerId: string

  constructor(props: FarmServiceRootProps) {
    this.status = "IDDLE"
    this.ownerId = props.ownerId
  }

  private getAccountDetails(accountName: string) {
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
}