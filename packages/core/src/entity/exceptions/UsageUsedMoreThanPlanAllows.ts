export class UsageUsedMoreThanPlanAllows extends Error {
  constructor() {
    super("Você não pode usar mais do que o seu plano permite.")
  }
}
