import { UsersSACsFarmingClusterStorage } from "~/application/services"

export class StopAllFarms {
  constructor(private readonly usersClusterStorage: UsersSACsFarmingClusterStorage) {}

  execute() {
    this.usersClusterStorage.stopAll()
  }
}
