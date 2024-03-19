import type { Prisma } from "@prisma/client"
import type { PlanInfinity, PlanUsage, User } from "core"

type UpdateData = Prisma.XOR<Prisma.UserUpdateInput, Prisma.UserUncheckedUpdateInput>
type CreateData = Prisma.XOR<Prisma.UserCreateInput, Prisma.UserUncheckedCreateInput>

export function getPlanCreation(plan: PlanUsage | PlanInfinity) {
  if (plan.custom) {
    throw new Error("TODO Implement persist custom plan")
    return {} satisfies Pick<CreateData, "plan">
  }
  return {
    plan: {
      create: {
        createdAt: new Date(),
        id_plan: plan.id_plan,
        name: plan.name,
        type: plan.type,
      },
    },
  } satisfies Pick<CreateData, "plan">
}

export function updateUser(user: User) {
  const plan = createPlanToUpdate(user.plan)

  const updateWithoutPlan: UpdateData = {
    email: user.email,
    ...plan,
    profilePic: user.profilePic,
    purchases: {
      connectOrCreate: user.purchases.map(p => ({
        where: { id_Purchase: p.id_Purchase },
        create: {
          createdAt: new Date(),
          id_Purchase: p.id_Purchase,
        },
      })),
    },
    role: user.role.name,
    status: user.status.name,
    username: user.username,
    steamAccounts: {
      disconnect: user.steamAccounts.getTrashIDs().map(id => ({ id_steamAccount: id })),
    },
  }

  return updateWithoutPlan
}

function createPlanToUpdate(plan: PlanUsage | PlanInfinity) {
  throw new Error("TODO Implement persist custom plan")
  if (plan.custom) {
    const dbPlan: Pick<UpdateData, "plan"> = {
      plan: {
        disconnect: true,
      },
    }
    return dbPlan
  }
  const dbPlan: Pick<UpdateData, "plan"> = {
    plan: {
      upsert: {
        where: {
          ownerId: plan.ownerId,
        },
        update: {
          usages: {
            connectOrCreate: plan.usages.data.map(u => ({
              where: { id_usage: u.id_usage },
              create: {
                amountTime: u.amountTime,
                createdAt: new Date(),
                id_usage: u.id_usage,
                accountName: u.accountName,
              },
            })),
          },
        },
        create: {
          createdAt: new Date(),
          id_plan: plan.id_plan,
          name: plan.name,
          type: plan.type,
          usages: {
            connectOrCreate: plan.usages.data.map(u => ({
              where: { id_usage: u.id_usage },
              create: {
                amountTime: u.amountTime,
                createdAt: new Date(),
                id_usage: u.id_usage,
                accountName: u.accountName,
              },
            })),
          },
        },
      },
    },
  }
  return dbPlan
}
