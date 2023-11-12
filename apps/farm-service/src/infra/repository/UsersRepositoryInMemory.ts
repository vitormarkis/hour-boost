import { User, UsersRepository } from "core"

export class UsersRepositoryInMemory implements UsersRepository {
  users: User[]

  constructor() {
    this.users = []
  }

  async getByID(userId: string): Promise<User | null> {
    return this.users.find(u => u.id_user === userId) ?? null
  }

  async update(user: User): Promise<void> {
    this.users = this.users.map(u => (u.id_user === user.id_user ? user : u))
  }

  async create(user: User): Promise<string> {
    this.users.push(user)
    return user.id_user
  }
}
