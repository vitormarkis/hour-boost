export class UserIsAlreadyFarmingException extends Error {
  constructor() {
    super("Usuário já está farmando.")
  }
}
