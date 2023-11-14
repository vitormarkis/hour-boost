export class UserIsNotFarmingException extends Error {
  constructor() {
    super("Usuário não está farmando.")
  }
}
