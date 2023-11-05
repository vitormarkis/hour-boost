import "dotenv/config"
import {
  ClerkExpressRequireAuth,
  ClerkExpressWithAuth,
  LooseAuthProp,
  WithAuthProp,
} from "@clerk/clerk-sdk-node"
import express, { Application, NextFunction, Request, Response } from "express"
import { prisma } from "./libs/prisma"
import clerkClient from "@clerk/clerk-sdk-node"
import {
  UserSession,
  User,
  AddSteamAccount,
  IAddSteamAccount,
  IListUserSteamAccounts,
  ISteamGame,
} from "core"
import { UsersRepositoryDatabase } from "./infra/repository/users-repository-database"
import cors from "cors"

const app: Application = express()
app.use(
  cors({
    origin: "*",
  })
)
app.use(express.json())
declare global {
  namespace Express {
    interface Request extends LooseAuthProp {}
  }
}

app.get("/me", ClerkExpressWithAuth(), async (req: WithAuthProp<Request>, res: Response) => {
  if (!req.auth.userId) {
    return res.status(400).json(null)
  }

  let user

  user = await prisma.user.findUnique({
    where: { id_user: req.auth.userId },
    include: {
      purchases: {
        select: { id_Purchase: true },
      },
      steamAccounts: {
        select: { id_steamAccount: true },
      },
    },
  })

  if (!user) {
    const clerkUser = await clerkClient.users.getUser(req.auth.userId)
    const userDomain = User.create({
      email: clerkUser.emailAddresses[0].emailAddress,
      id_user: clerkUser.id,
      profilePic: clerkUser.imageUrl,
      username: clerkUser.username ?? `guest_${Math.random().toString(36).substring(2, 12)}`,
    })
    user = await prisma.user.create({
      data: {
        id_user: userDomain.id_user,
        createdAt: new Date(),
        email: userDomain.email,
        plan: userDomain.plan.name,
        profilePic: userDomain.profilePic,
        role: userDomain.role.name,
        status: userDomain.status.name,
        username: userDomain.username,
      },
      include: {
        purchases: {
          select: { id_Purchase: true },
        },
        steamAccounts: {
          select: { id_steamAccount: true },
        },
      },
    })
  }

  return res.json({
    id_user: user.id_user,
    email: user.email,
    plan: user.plan,
    profilePic: user.profilePic,
    purchases: user.purchases.map(p => p.id_Purchase),
    role: user.role,
    status: user.status,
    steamAccounts: user.steamAccounts.map(sA => sA.id_steamAccount),
    username: user.username,
  } as UserSession)
})

app.post("/steam-accounts", ClerkExpressRequireAuth(), async (req: WithAuthProp<Request>, res: Response) => {
  try {
    const usersRepository = new UsersRepositoryDatabase(prisma)
    const addSteamAccount = new AddSteamAccount(usersRepository)
    const { accountName, password } = req.body as IAddSteamAccount
    const output = await addSteamAccount.execute({
      accountName,
      password,
      userId: req.auth.userId!,
    })
    return res.status(201).json(output)
  } catch (error) {
    if (error instanceof Error) {
      return res.status(500).json({
        message: error.message,
      })
    }
  }
})

app.get("/steam-accounts", ClerkExpressRequireAuth(), async (req: WithAuthProp<Request>, res: Response) => {
  try {
    const userSteamAccountsDatabase = await prisma.steamAccount.findMany({
      where: { owner_id: req.auth.userId! },
      select: {
        accountName: true,
        id_steamAccount: true,
        games: true,
      },
    })
    const userSteamAccounts: IListUserSteamAccounts.Output = userSteamAccountsDatabase.map(sa => ({
      accountName: sa.accountName,
      games: sa.games.map(
        g =>
          ({
            gameId: g.gameId,
            id_steamGame: g.id_steamGame,
          }) satisfies ISteamGame
      ),
      id_steamAccount: sa.id_steamAccount,
    }))

    return res.json(userSteamAccounts as IListUserSteamAccounts.Output)
  } catch (error) {
    if (error instanceof Error) {
      return res.status(500).json({
        message: error.message,
      })
    }
  }
})

app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error(err.stack)
  return res.status(401).send("Unauthenticated!")
})

app.listen(3309, () => {
  console.log("Server is running on port 3309")
})
