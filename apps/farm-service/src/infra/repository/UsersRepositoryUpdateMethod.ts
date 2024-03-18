import type { $Enums, Prisma } from "@prisma/client"
import type { PlanCustomName, PlanInfinity, PlanNormalName, PlanUsage, User } from "core"

type UpdateData = Prisma.XOR<Prisma.UserUpdateInput, Prisma.UserUncheckedUpdateInput>
type CreateData = Prisma.XOR<Prisma.UserCreateInput, Prisma.UserUncheckedCreateInput>

export function getPlanCreation(plan: PlanUsage | PlanInfinity) {
  if (plan.custom) {
    return {
      custom_plan: {
        create: {
          createdAt: new Date(),
          id_plan: plan.id_plan,
          name: mapCustomPlanName_toPrisma(plan.name as PlanCustomName),
          type: plan.type,
          maxGamesAllowed: plan.maxGamesAllowed,
          maxSteamAccounts: plan.maxSteamAccounts,
          maxUsageTime: "maxUsageTime" in plan ? plan.maxUsageTime : 0,
          priceInCents: plan.price,
          autoRelogin: plan.autoRestarter,
        },
      },
    } satisfies Pick<CreateData, "plan" | "custom_plan">
  }
  return {
    plan: {
      create: {
        createdAt: new Date(),
        id_plan: plan.id_plan,
        name: plan.name as PlanNormalName,
        type: plan.type,
      },
    },
  } satisfies Pick<CreateData, "plan" | "custom_plan">
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
  if (plan.custom) {
    const dbPlan: Pick<UpdateData, "plan" | "custom_plan"> = {
      plan: {
        disconnect: true,
      },
      custom_plan: {
        upsert: {
          where: {
            ownerId: plan.ownerId,
          },
          update: {
            maxGamesAllowed: plan.maxGamesAllowed,
            maxSteamAccounts: plan.maxSteamAccounts,
            maxUsageTime: "maxUsageTime" in plan ? plan.maxUsageTime : 0,
            priceInCents: plan.price,
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
            maxGamesAllowed: plan.maxGamesAllowed,
            maxSteamAccounts: plan.maxSteamAccounts,
            maxUsageTime: "maxUsageTime" in plan ? plan.maxUsageTime : 0,
            priceInCents: plan.price,
            autoRelogin: plan.autoRestarter,
            id_plan: plan.id_plan,
            name: mapCustomPlanName_toPrisma(plan.name as PlanCustomName),
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
  const dbPlan: Pick<UpdateData, "plan" | "custom_plan"> = {
    custom_plan: {
      disconnect: true,
    },
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
          name: plan.name as PlanNormalName,
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

export function mapCustomPlanName_toPrisma(planName: PlanCustomName): $Enums.PlanNameCustom {
  switch (planName) {
    case "INFINITY-CUSTOM":
      return "CUSTOM_INFINITY_PLAN"
    case "USAGE-CUSTOM":
      return "CUSTOM_USAGE_PLAN"
  }
}
