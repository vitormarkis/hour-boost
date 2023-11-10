import { User } from "../entity/User"

export interface UsersRepository {
  getByID(userId: string): Promise<User | null>
  update(user: User): Promise<void>
  create(user: User): Promise<string>
}
