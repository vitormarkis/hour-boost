import { ApplicationError, User, UsersRepository } from "core"
import { UsersInMemory } from "./UsersInMemory"

export class UsersRepositoryInMemory implements UsersRepository {
  constructor(private readonly usersMemory: UsersInMemory) {}

  async dropAll(): Promise<void> {
    return this.usersMemory.dropAll()
  }

  async getByID(userId: string): Promise<User | null> {
    return this.usersMemory.users.find(u => u.id_user === userId) ?? null
  }

  async getByUsername(username: string): Promise<User | null> {
    return this.usersMemory.users.find(u => u.username === username) ?? null
  }

  async update(user: User): Promise<void> {
    const foundUserIndex = this.usersMemory.users.findIndex(u => u.id_user === user.id_user)
    if (foundUserIndex === -1)
      throw new ApplicationError(
        "Usuário não encontrado.",
        404,
        `repo em memory, tentou atualizar um usuário que não existia no bando de dados.`
      )
    this.usersMemory.users[foundUserIndex] = user
  }

  async create(user: User): Promise<string> {
    this.usersMemory.users.push(user)
    return user.id_user
  }
}
