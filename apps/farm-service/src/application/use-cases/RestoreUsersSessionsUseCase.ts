import type { UseCase, User } from "core"
import type { UsersSACsFarmingClusterStorage } from "~/application/services"

export namespace RestoreUsersSessionsUseCaseHandle {
  export type Payload = {
    users: User[]
  }

  export type Response = Promise<void>
}

export class RestoreUsersSessionsUseCase
  implements UseCase<RestoreUsersSessionsUseCaseHandle.Payload, RestoreUsersSessionsUseCaseHandle.Response>
{
  constructor(private readonly usersSACsFarmingClusterStorage: UsersSACsFarmingClusterStorage) {}

  async execute({ users }: APayload): AResponse {
    for (const user of users) {
      this.usersSACsFarmingClusterStorage.add(user.username, user.plan)
    }
  }
}

type APayload = RestoreUsersSessionsUseCaseHandle.Payload
type AResponse = RestoreUsersSessionsUseCaseHandle.Response
