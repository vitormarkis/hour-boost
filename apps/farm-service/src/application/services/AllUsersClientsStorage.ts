import { ApplicationError, PlanRepository, SteamAccountClientStateCacheRepository } from "core"
import { UserClientsStorage } from "~/application/services"
import { SteamAccountClient } from "~/application/services/steam"
import { FarmGamesUseCase } from "~/application/use-cases/FarmGamesUseCase"
import { SteamAccountClientBuilder } from "~/utils/builders"

type UserID = string
export class AllUsersClientsStorage {
  users: Map<UserID, UserClientsStorage> = new Map()

  constructor(
    private readonly sacBuilder: SteamAccountClientBuilder,
    private readonly sacStateCacheRepository: SteamAccountClientStateCacheRepository,
    private readonly farmGamesUseCase: FarmGamesUseCase,
    private readonly planRepository: PlanRepository
  ) {}

  private generateSAC({ accountName, userId, username, planId }: AddUserProps) {
    return this.sacBuilder.create({
      accountName,
      userId,
      username,
      planId,
    })
  }

  private generateUserClients(): UserClientsStorage {
    return new UserClientsStorage(this.sacStateCacheRepository, this.farmGamesUseCase, this.planRepository)
  }

  getOrAddSteamAccount({ accountName, userId, username, planId }: AddUserProps): SteamAccountClient {
    const userClients = this.get(userId)
    const userRegistered = !!userClients
    const foundSac = userClients?.getAccountClient(accountName)
    const userHasAccount = !!foundSac
    if (!userRegistered) {
      this.registerUser(userId, this.generateUserClients())
      return this.addSteamAccount(userId, this.generateSAC({ accountName, userId, username, planId }))
    }
    if (!userHasAccount) {
      return this.addSteamAccount(userId, this.generateSAC({ accountName, userId, username, planId }))
    }
    return foundSac
  }

  removeSteamAccount(userId: string, accountName: string) {
    const userSteamClients = this.getOrThrow(userId)
    userSteamClients.removeAccountClient(accountName)
  }

  addSteamAccount(userId: string, steamAccountClient: SteamAccountClient): SteamAccountClient {
    const userClientsStorage = this.users.get(userId)
    if (!userClientsStorage) {
      const userClientsStorage = new UserClientsStorage(
        this.sacStateCacheRepository,
        this.farmGamesUseCase,
        this.planRepository
      )
      userClientsStorage.addAccountClient(steamAccountClient)
      this.registerUser(userId, userClientsStorage)
      return steamAccountClient
    }
    userClientsStorage.addAccountClient(steamAccountClient)
    return steamAccountClient
  }

  addSteamAccountFrom0({ accountName, userId, username, planId }: AddUserProps): SteamAccountClient {
    const sac = this.sacBuilder.create({ accountName, userId, username, planId })
    this.addSteamAccount(userId, sac)
    return sac
  }

  registerUser(userID: string, userClientsStorage: UserClientsStorage) {
    this.users.set(userID, userClientsStorage)
    return userClientsStorage
  }

  get(userId: string) {
    return this.users.get(userId) ?? null
  }

  getOrThrow(userId: string) {
    const userSteamClients = this.users.get(userId)
    if (!userSteamClients) {
      throw new ApplicationError("Esse usuário não possui contas da Steam ativas na plataforma.", 406)
    }
    return userSteamClients
  }

  getOrNull(userId: string) {
    const userSteamClients = this.users.get(userId) ?? null
    return { userSteamClients }
  }

  getAccountClient(userID: string, accountName: string) {
    const userClientsStorage = this.users.get(userID)
    const steamAccountClient = userClientsStorage?.getAccountClientOrThrow(accountName) ?? {}
    return steamAccountClient ?? null
  }

  getAccountClientOrThrow(userID: string, accountName: string) {
    const userSteamClients = this.getOrThrow(userID)
    const steamAccountClient = userSteamClients.getAccountClientOrThrow(accountName)
    return steamAccountClient
  }

  listUsers() {
    const usersIDs = {} as Record<string, Record<string, { farming: boolean }>>
    for (const [userId, client] of this.users.entries()) {
      usersIDs[userId] = client.getAccountsStatus()
    }
    return usersIDs
  }
}

export type AddUserProps = {
  userId: string
  username: string
  accountName: string
  planId: string
}
