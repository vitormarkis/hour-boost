import { GuestPlan } from "core"
import { prisma } from "./src/libs/prisma"
import { UsersRepositoryDatabase } from "./src/infra/repository/UsersRepositoryDatabase"

async function main() {
  console.log("rodando seed")
  const usersRepository = new UsersRepositoryDatabase(prisma)

  await new Promise(res => setTimeout(res, 2000))

  const dbUsers = await prisma.user.findMany({
    select: { id_user: true },
  })

  const usersDomain = await Promise.all(dbUsers.map(user => usersRepository.getByID(user.id_user)))

  for (const user of usersDomain) {
    user.assignPlan(
      GuestPlan.create({
        ownerId: user.id_user,
      })
    )
  }

  console.log("Todos users receberam o plano guest", usersDomain)

  await Promise.all(usersDomain.map(user => usersRepository.update(user)))
}

main()
