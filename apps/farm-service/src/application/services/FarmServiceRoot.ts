import { ApplicationError, PlanType } from "core"
import { FarmServiceStatus, IFarmService } from "~/application/services"

export type FarmingAccountDetails = {
  usageAmountInSeconds: number
  status: "FARMING" | "IDDLE"
}


type FarmServiceRootProps = {
  type: PlanType
  status: FarmServiceStatus
  ownerId: string
}

export abstract class FarmService {
  readonly accountsFarming = new Map<string, FarmingAccountDetails>()
  readonly type: PlanType
  readonly status: FarmServiceStatus
  readonly ownerId: string

  constructor(props: FarmServiceRootProps) {
    this.type = props.type
    this.status = props.status
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
    this.isAccountAdded(accountName) ? this.resumeFarming(accountName) : this.appendAccount(accountName)
    if (this.getActiveFarmingAccountsAmount() === 0) {
      this.startFarm()
    }
  }

  pauseFarmOnAccount(accountName: string): void {
    this.setAccountStatus(accountName, "IDDLE")
    if (this.getActiveFarmingAccountsAmount() === 1) {
      this.stopFarm()
    }
  }

  protected abstract startFarm(): void

  protected abstract stopFarm(): void

  private getActiveFarmingAccounts() {
    return Array.from(this.accountsFarming).filter(([_, details]) => details.status === "FARMING")
  }

  private getActiveFarmingAccountsAmount() {
    return this.getActiveFarmingAccounts().length
  }

  hasAccountsFarming(): boolean {
    return this.getActiveFarmingAccountsAmount() > 0
  }

}