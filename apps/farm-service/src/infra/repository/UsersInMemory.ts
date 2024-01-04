import { User } from "core"

export class UsersInMemory {
  users: User[] = []

  dropAll() {
    this.users = []
  }

  dropAllSteamAccounts() {
    for (const user of this.users) {
      user.steamAccounts.deleteAll()
    }
  }
}
