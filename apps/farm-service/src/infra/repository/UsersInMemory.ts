import { User } from "core"

export class UsersInMemory {
  users: User[] = []

  dropAll() {
    this.users = []
  }
}
