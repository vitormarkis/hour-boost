import { Fail } from "core/entity"
import { AppAccountStatus, AppAccountStatusIddle } from "core/presenters"
import { bad, nice } from "core/utils"
import { makeError } from "core/utils/throw"

export class CacheState {
  gamesPlaying: number[]
  gamesStaging: number[]
  accountName: string
  planId: string
  username: string
  farmStartedAt: Date | null
  status: AppAccountStatusIddle

  private constructor(props: NSCacheState.Restore) {
    if (props.gamesPlaying.length > 0 && props.farmStartedAt === null)
      throw makeError("Invariant! Está farmando mas started at está como nulo.", props)
    if (props.gamesPlaying.length === 0 && props.farmStartedAt !== null)
      throw makeError("Invariant! Não está farmando e started at está truthy.", props)

    this.gamesPlaying = props.gamesPlaying
    this.gamesStaging = props.gamesStaging
    this.accountName = props.accountName
    this.planId = props.planId
    this.username = props.username
    this.farmStartedAt = props.farmStartedAt
    this.status = props.status
  }

  stageGames(gamesId: number[]) {
    this.gamesStaging = gamesId
  }

  changeStatus(status: AppAccountStatus) {
    this.status = status
  }

  farmGames(gamesIdList: number[]) {
    if (gamesIdList.length === 0)
      throw new Error("NSTH: Tentativa de farmar 0 jogos. 0 jogos significa não farmando.")
    if (!this.isFarming()) {
      this.farmStartedAt = new Date()
    }
    this.gamesPlaying = gamesIdList
  }

  isFarming() {
    return this.gamesPlaying.length > 0
  }

  stopFarm() {
    this.gamesPlaying = []
    if (!this.farmStartedAt) return bad(Fail.create("ATTEMPT_TO_STOP_FARM_ON_NULL_FARM_STARTED_AT", 403))
    const usage = {
      amountTime: this.calculateManySecondsSince(this.farmStartedAt),
    }
    this.farmStartedAt = null
    return nice(usage)
  }

  private calculateManySecondsSince(date: Date) {
    return (new Date().getTime() - date.getTime()) / 1000
  }

  static create(props: NSCacheState.Create) {
    return new CacheState({
      ...props,
      farmStartedAt: null,
      gamesPlaying: [],
      gamesStaging: [],
    })
  }

  static restore(props: NSCacheState.Restore) {
    return new CacheState(props)
  }

  static restoreFromDTO(props: CacheStateDTO) {
    return new CacheState(fromDTOToRestore(props))
  }

  restoreHollow(props: CacheStateHollow) {
    return new CacheState({
      ...props,
      farmStartedAt: null,
      gamesStaging: [],
      gamesPlaying: [],
      status: "iddle",
    })
  }

  toDTO(): CacheStateDTO {
    return {
      accountName: this.accountName,
      gamesPlaying: this.gamesPlaying,
      gamesStaging: this.gamesStaging,
      planId: this.planId,
      status: this.status,
      username: this.username,
      farmStartedAt: this.farmStartedAt?.getTime() ?? null,
      isFarming: this.isFarming(),
    }
  }
}

export type CacheStateHollow = Pick<CacheStateDTO, "accountName" | "planId" | "username">

function fromDTOToRestore(props: CacheStateDTO): NSCacheState.Restore {
  return {
    accountName: props.accountName,
    farmStartedAt: props.farmStartedAt ? new Date(props.farmStartedAt) : null,
    gamesPlaying: props.gamesPlaying,
    gamesStaging: props.gamesStaging,
    planId: props.planId,
    status: props.status,
    username: props.username,
  }
}

export interface CacheStateDTO {
  gamesPlaying: number[]
  gamesStaging: number[]
  accountName: string
  isFarming: boolean
  username: string
  planId: string
  farmStartedAt: number | null
  status: AppAccountStatusIddle
}

export namespace NSCacheState {
  export type Create = {
    accountName: string
    planId: string
    username: string
    status: AppAccountStatusIddle
  }

  export type Restore = {
    gamesPlaying: number[]
    gamesStaging: number[]
    accountName: string
    planId: string
    username: string
    farmStartedAt: Date | null
    status: AppAccountStatusIddle
  }
}
