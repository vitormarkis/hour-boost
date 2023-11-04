import "dotenv/config"
import { ClerkExpressWithAuth, LooseAuthProp, WithAuthProp } from "@clerk/clerk-sdk-node"
import express, { Application, NextFunction, Request, Response } from "express"
import { prisma } from "./libs/prisma"
import clerkClient from "@clerk/clerk-sdk-node"
import { UserSession, User } from "core"

const app: Application = express()
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

app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error(err.stack)
  return res.status(401).send("Unauthenticated!")
})

app.listen(3309, () => {
  console.log("Server is running on port 3309")
})
