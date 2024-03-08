import type { DataOrFail, Fail, UserAdminPanelSession, UsersDAO } from "core"
import { nice } from "~/utils/helpers"

export class GetUsersAdminListUseCase implements IGetUsersAdminListUseCase {
  constructor(private readonly usersDAO: UsersDAO) {}

  async execute({}: GetUsersAdminListUseCasePayload) {
    const usersAdminList = await this.usersDAO.getUsersAdminList()
    return nice(usersAdminList)
  }
}

export type GetUsersAdminListUseCasePayload = {}

interface IGetUsersAdminListUseCase {
  execute(...args: any[]): Promise<DataOrFail<Fail, UserAdminPanelSession[]>>
}
