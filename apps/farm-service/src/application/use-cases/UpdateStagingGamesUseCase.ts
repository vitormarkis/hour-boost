import { DataOrFail, Fail, SteamAccountClientStateCacheRepository, UsersRepository } from "core"
import { UsersSACsFarmingClusterStorage } from "~/application/services"
import { EAppResults } from "~/application/use-cases"
import { StagingGamesListService } from "~/domain/services"
import { FailGeneric } from "~/types/EventsApp.types"
import { bad, nice } from "~/utils/helpers"

export type UpdateStagingGamesUseCasePayload = {
  newGameList: number[]
  userId: string
  accountName: string
}

interface IUpdateStagingGamesUseCase {
  execute(...args: any[]): Promise<DataOrFail<FailGeneric>>
}

export class UpdateStagingGamesUseCase implements IUpdateStagingGamesUseCase {
  constructor(
    private readonly stagingGamesListService: StagingGamesListService,
    private readonly usersSACsFarmingClusterStorage: UsersSACsFarmingClusterStorage,
    private readonly usersRepository: UsersRepository,
    private readonly steamAccountClientStateCacheRepository: SteamAccountClientStateCacheRepository
  ) {}

  async execute({ newGameList, userId, accountName }: UpdateStagingGamesUseCasePayload) {
    const user = await this.usersRepository.getByID(userId)

    if (!user) {
      const fail = new Fail({
        code: EAppResults["USER-NOT-FOUND"],
        httpStatus: 404,
        payload: {
          givenUserId: userId,
          foundUser: user,
        },
      })
      return bad(fail)
    }

    const [errorFindingUserCluster, userCluster] = this.usersSACsFarmingClusterStorage.get(user.username)
    if (errorFindingUserCluster) return bad(errorFindingUserCluster)

    const [errorUpdatingStagingGameList, updatedSACStateCache] = await this.stagingGamesListService.update({
      accountName,
      newGameList,
      plan: user.plan,
      userCluster,
    })

    if (errorUpdatingStagingGameList) return bad(errorUpdatingStagingGameList)

    await this.steamAccountClientStateCacheRepository.set(accountName, updatedSACStateCache.toJSON())

    return nice(updatedSACStateCache)
  }
}
