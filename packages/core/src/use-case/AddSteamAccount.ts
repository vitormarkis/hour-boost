import { IDGenerator } from "core/contracts"
import { ApplicationError, SteamAccount, SteamAccountCredentials } from "core/entity"
import { SteamAccountsRepository, UsersRepository } from "core/repository"

export class AddSteamAccount {
  constructor(
    private readonly usersRepository: UsersRepository,
    private readonly steamAccountsRepository: SteamAccountsRepository,
    private readonly idGenerator: IDGenerator
  ) {}

  async execute(input: AddSteamAccountInput): Promise<AddSteamAccountOutput> {
    const user = await this.usersRepository.getByID(input.userId)
    if (!user) throw new ApplicationError("No user found!", 404)
    const newSteamAccount = SteamAccount.create({
      idGenerator: this.idGenerator,
      credentials: SteamAccountCredentials.create({
        accountName: input.accountName,
        password: input.password,
      }),
      ownerId: user.id_user,
    })
    user.addSteamAccount(newSteamAccount)
    await this.usersRepository.update(user)
    return {
      steamAccountID: newSteamAccount.id_steamAccount,
    }
  }
}

export type AddSteamAccountInput = {
  accountName: string
  password: string
  userId: string
}

export type AddSteamAccountOutput = {
  steamAccountID: string
}
