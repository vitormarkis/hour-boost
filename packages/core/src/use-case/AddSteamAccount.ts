import { IDGenerator } from "core/contracts"
import { Fail, SteamAccount, SteamAccountCredentials } from "core/entity"
import { UsersRepository } from "core/repository"
import { bad, nice } from "core/utils"

export class AddSteamAccount {
  constructor(
    private readonly usersRepository: UsersRepository,
    private readonly idGenerator: IDGenerator
  ) {}

  async execute(input: AddSteamAccountInput) {
    const user = await this.usersRepository.getByID(input.userId)
    if (!user) return bad(Fail.create("USER_NOT_FOUND", 404))
    const newSteamAccount = SteamAccount.create({
      idGenerator: this.idGenerator,
      credentials: SteamAccountCredentials.create({
        accountName: input.accountName,
        password: input.password,
      }),
      ownerId: user.id_user,
    })
    const [error] = user.addSteamAccount(newSteamAccount)
    if (error) return bad(error)
    await this.usersRepository.update(user)
    return nice({
      steamAccountId: newSteamAccount.id_steamAccount,
    })
  }
}

export type AddSteamAccountInput = {
  accountName: string
  password: string
  userId: string
}

export type AddSteamAccountOutput = {
  steamAccountId: string
}

export type AddSteamAccountHTTPResponse = {
  steamAccountId: string
  message: string
}
