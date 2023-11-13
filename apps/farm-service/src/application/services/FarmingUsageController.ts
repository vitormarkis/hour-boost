export const temp = undefined
// import { UsersRepository, FarmController, FarmStatusCount } from "core"
// import { FarmUsageService } from "~/domain/service"
// import { Publisher } from "~/infra/queue"

// export class FarmingUsageController implements FarmController {
//   readonly farmingUsers: Map<string, FarmUsageService> = new Map()

//   constructor(
//     private readonly publisher: Publisher,
//     private readonly usersRepository: UsersRepository
//   ) {}

//   async startFarm(userId: string) {
//     const user = await this.usersRepository.getByID(userId)
//     if (!user) {
//       console.log({ userId_NOT_FOUND: userId })
//       throw new Error("User not found")
//     }
//     const farmingUser = this.farmingUsers.get(user.username)
//     if (!farmingUser) {
//       const userFarmService = new FarmUsageService(this.publisher, user)
//       this.farmingUsers.set(userFarmService.user.username, userFarmService)
//       userFarmService.startFarm()
//       return
//     }
//     farmingUser.startFarm()
//   }

//   async stopFarm(userId: string) {
//     const user = await this.usersRepository.getByID(userId)
//     if (!user) {
//       console.log({ userId_NOT_FOUND: userId })
//       throw new Error("User not found")
//     }
//     const farmingUser = this.farmingUsers.get(user.username)
//     if (!farmingUser) {
//       const farmingUsers = Object.keys(Object.fromEntries(this.farmingUsers.entries()))
//       console.log({ farmingUsers })
//       throw new Error("User is not farming")
//     }
//     farmingUser.stopFarm()
//   }

//   listFarmingStatusCount(): FarmStatusCount {
//     let FARMING = 0
//     let IDDLE = 0
//     this.farmingUsers.forEach(user => {
//       if (user.status === "FARMING") ++FARMING
//       if (user.status === "IDDLE") ++IDDLE
//     })

//     return {
//       FARMING,
//       IDDLE,
//     }
//   }
// }
