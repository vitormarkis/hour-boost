import { SteamAccount } from "../entity/SteamAccount"
import { SteamAccountCredentials } from "../entity/SteamAccountCredentials"
import { UsersRepository } from "../repository/users-repository"

export class AddSteamAccount {
  constructor(private readonly usersRepository: UsersRepository) {}

  async execute(input: AddSteamAccountInput): Promise<AddSteamAccountOutput> {
    const user = await this.usersRepository.getByID(input.userId)
    if (!user) throw new Error("No user found!")
    const newSteamAccount = SteamAccount.create({
      credentials: SteamAccountCredentials.create({
        accountName: input.accountName,
        password: input.password,
      }),
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
