import { UseCase } from "core"
import { UsersSACsFarmingClusterStorage } from "~/application/services"

export namespace StopAllFarmsHandle {
  export type Payload = {
    killSession: boolean
  }

  export type Response = void
}

export class StopAllFarms implements UseCase<StopAllFarmsHandle.Payload, StopAllFarmsHandle.Response> {
  constructor(private readonly usersClusterStorage: UsersSACsFarmingClusterStorage) {}

  execute({ killSession }: APayload) {
    this.usersClusterStorage.stopAll(killSession)
  }
}

type APayload = StopAllFarmsHandle.Payload
type AResponse = StopAllFarmsHandle.Response
