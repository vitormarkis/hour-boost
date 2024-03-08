import type { UseCase } from "core"
import type { UsersSACsFarmingClusterStorage } from "~/application/services"

export namespace StopAllFarmsHandle {
  export type Payload = {
    isFinalizingSession: boolean
  }

  export type Response = void
}

export class StopAllFarms implements UseCase<StopAllFarmsHandle.Payload, StopAllFarmsHandle.Response> {
  constructor(private readonly usersClusterStorage: UsersSACsFarmingClusterStorage) {}

  execute({ isFinalizingSession }: APayload) {
    this.usersClusterStorage.stopAll(isFinalizingSession)
  }
}

type APayload = StopAllFarmsHandle.Payload
type AResponse = StopAllFarmsHandle.Response
