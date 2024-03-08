import { ApplicationError, type User, type UsersRepository } from "core"
import type { SteamAccountsInMemory } from "~/infra/repository/SteamAccountsInMemory"
import type { UsersInMemory } from "./UsersInMemory"

export class UsersRepositoryInMemory implements UsersRepository {
  constructor(
    private readonly usersMemory: UsersInMemory,
    private readonly steamAccountsMemory: SteamAccountsInMemory
  ) {}

  async dropAll(): Promise<void> {
    return this.usersMemory.dropAll()
  }

  async getByID(userId: string): Promise<User | null> {
    const user = this.usersMemory.users.find(u => u.id_user === userId)
    if (!user) return null
    return this.appendSteamAccounts(user)
  }

  private appendSteamAccounts(user: User): User {
    const steamAccountIDList = user.steamAccounts.getIDs()
    user.steamAccounts.deleteAll()
    for (const id of steamAccountIDList) {
      try {
        const foundSteamAccount = this.steamAccountsMemory.getById(id)
        user.addSteamAccount(foundSteamAccount)
      } catch (e) {
        console.log("trying to find ")
      }
    }
    return user
  }

  private registerSteamAccounts(user: User) {
    this.steamAccountsMemory.addIfDontExists([...user.steamAccounts.data, ...user.steamAccounts.trash])
  }

  async getByUsername(username: string): Promise<User | null> {
    return this.usersMemory.users.find(u => u.username === username) ?? null
  }

  async update(user: User): Promise<void> {
    this.registerSteamAccounts(user)
    this.steamAccountsMemory.disownSteamAccounts(user.steamAccounts.getTrashIDs())
    user.steamAccounts.eraseTrash()

    const foundUserIndex = this.usersMemory.users.findIndex(u => u.id_user === user.id_user)
    if (foundUserIndex === -1)
      throw new ApplicationError(
        "Usuário não encontrado.",
        404,
        "repo em memory, tentou atualizar um usuário que não existia no banco de dados."
      )
    this.usersMemory.users[foundUserIndex] = user
  }

  async create(user: User): Promise<string> {
    this.usersMemory.users.push(user)
    return user.id_user
  }

  async findMany(): Promise<User[]> {
    return this.usersMemory.users
  }
}
