import { UsersRepository } from "core"

export async function listAllAccountsInDatabase(usersRepository: UsersRepository) {
  const foundUsers = await usersRepository.findMany()
  const allAccounts = foundUsers
    .map(user => user.steamAccounts.data.map(sa => sa.credentials.accountName))
    .flat(Infinity)

  return allAccounts
}
