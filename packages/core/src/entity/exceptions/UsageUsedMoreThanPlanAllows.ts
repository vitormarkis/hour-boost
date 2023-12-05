import { ApplicationError } from "./ApplicationError"

export class UsageUsedMoreThanPlanAllows extends ApplicationError {
  constructor() {
    super("Você não pode usar mais do que o seu plano permite.")
  }
}
