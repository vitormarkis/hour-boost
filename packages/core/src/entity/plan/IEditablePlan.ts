export interface IEditablePlan {
  setMaxGamesAmount(amount: number): void
  setMaxAccountsAmount(amount: number): void
}

export interface IEditablePlanUsage extends IEditablePlan {
  addMoreUsageTime(amount: number): void
}

export interface IEditablePlanInfinity extends IEditablePlan {}
