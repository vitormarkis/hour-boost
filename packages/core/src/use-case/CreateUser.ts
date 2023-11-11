import { UserAuthentication } from "core/contracts"
import { User } from "core/entity"
import { UsersRepository } from "core/repository"

export class CreateUser {
  constructor(
    private readonly usersRepository: UsersRepository,
    private readonly userAuthentication: UserAuthentication
  ) {}

  async execute(userId: string) {
    const authUser = await this.userAuthentication.getUserByID(userId)
    const userDomain = User.create({
      email: authUser.email,
      id_user: authUser.id_user,
      profilePic: authUser.profilePic,
      username: authUser.username,
    })
    await this.usersRepository.create(userDomain)
  }
}
