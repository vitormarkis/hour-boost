import {
  DataOrFail,
  Fail,
  GetError,
  SteamAccountClientStateCacheRepository,
  User,
  UsersRepository,
} from "core"
import { AllUsersClientsStorage } from "~/application/services"
import { getUserSACs_OnStorage_ByUser_UpdateStates } from "~/utils/getUser"
import { bad, nice } from "~/utils/helpers"
import { ResetFarm } from "~/utils/resetFarm"

interface IFlushUpdateSteamAccountUseCase {
  execute(props: Input): Promise<DataOrFail<Fail>>
}

export class FlushUpdateSteamAccountUseCase implements IFlushUpdateSteamAccountUseCase {
  constructor(
    private readonly resetFarm: ResetFarm,
    private readonly allUsersClientsStorage: AllUsersClientsStorage,
    private readonly usersRepository: UsersRepository,
    private readonly steamAccountClientStateCacheRepository: SteamAccountClientStateCacheRepository
  ) {}

  async execute({ user }: Input) {
    const [error, updatedCacheStates] = getUserSACs_OnStorage_ByUser_UpdateStates(
      user,
      this.allUsersClientsStorage,
      user.plan
    )
    if (error) return bad(Fail.create(error.code, 400, error))
    await this.usersRepository.update(user)

    for (const state of updatedCacheStates) {
      await this.steamAccountClientStateCacheRepository.save(state)
    }

    const errorsList: GetError<ResetFarm>[] = []
    for (const steamAccount of user.steamAccounts.data) {
      const [errorReseting] = await this.resetFarm({
        accountName: steamAccount.credentials.accountName,
        planId: user.plan.id_plan,
        userId: user.id_user,
        username: user.username,
        isFinalizingSession: false,
      })
      if (errorReseting) errorsList.push(errorReseting)
    }
    if (errorsList.length) return bad(Fail.create("LIST:ERROR-RESETING-FARM", 400, { errorsList }))
    return nice()
  }
}

type Input = {
  user: User
}
