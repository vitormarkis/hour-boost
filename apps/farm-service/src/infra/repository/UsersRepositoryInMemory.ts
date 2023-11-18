import { User, UsersRepository } from "core"
import { UsersInMemory } from "./UsersInMemory"

export class UsersRepositoryInMemory implements UsersRepository {
  constructor(private readonly usersMemory: UsersInMemory) {}
  async getByID(userId: string): Promise<User | null> {
    return this.usersMemory.users.find(u => u.id_user === userId) ?? null
  }

  async getByUsername(username: string): Promise<User | null> {
    return this.usersMemory.users.find(u => u.username === username) ?? null
  }

  async update(user: User): Promise<void> {
    this.usersMemory.users = this.usersMemory.users.map(u => (u.id_user === user.id_user ? user : u))
  }

  async create(user: User): Promise<string> {
    this.usersMemory.users.push(user)
    return user.id_user
  }
}
