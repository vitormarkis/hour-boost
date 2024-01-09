import { User, UserAuthentication, UsersRepository } from "core"
import { UsersSACsFarmingClusterStorage } from "~/application/services"

export class CreateUserUseCase {
  constructor(
    private readonly usersRepository: UsersRepository,
    private readonly userAuthentication: UserAuthentication,
    private readonly usersSACsFarmingClusterStorage: UsersSACsFarmingClusterStorage
  ) {}

  async execute(userId: string): Promise<User> {
    const authUser = await this.userAuthentication.getUserByID(userId)
    const user = User.create({
      email: authUser.email,
      id_user: authUser.id_user,
      profilePic: authUser.profilePic,
      username: authUser.username,
    })
    await this.usersRepository.create(user)
    this.usersSACsFarmingClusterStorage.add(user.username, user.plan)
    return user
  }
}
