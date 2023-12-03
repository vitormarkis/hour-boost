import { ApplicationError } from "./ApplicationError"

export class UserIsNotFarmingException extends ApplicationError {
	constructor() {
		super("Usuário não está farmando.")
	}
}
