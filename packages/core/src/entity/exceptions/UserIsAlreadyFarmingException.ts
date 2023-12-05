import { ApplicationError } from "./ApplicationError"

export class UserIsAlreadyFarmingException extends ApplicationError {
  constructor() {
    super("Usuário já está farmando.")
  }
}
