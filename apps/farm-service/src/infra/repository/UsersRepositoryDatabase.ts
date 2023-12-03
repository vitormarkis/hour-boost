import { Prisma, PrismaClient } from "@prisma/client"
import { ApplicationError, PlanUsage, SteamAccountList } from "core"
import { ActiveStatus, BannedStatus, Status, StatusName } from "core"
import {
	AdminRole,
	Purchase,
	Role,
	RoleName,
	SteamAccount,
	SteamAccountCredentials,
	User,
	UserRole,
} from "core"
import { UsersRepository } from "core"

import { getCurrentPlan, getCurrentPlanOrCreateOne } from "~/utils"

export class UsersRepositoryDatabase implements UsersRepository {
	constructor(private readonly prisma: PrismaClient) {}
	async dropAll(): Promise<void> {
		console.log("Você acidentalmente tentou limpar o banco de dados.")
	}
	async create(user: User): Promise<string> {
		const { id_user } = await this.prisma.user.create({
			data: {
				id_user: user.id_user,
				createdAt: new Date(),
				email: user.email,
				plan: {
					create: {
						createdAt: new Date(),
						id_plan: user.plan.id_plan,
						name: user.plan.name,
						type: user.plan.type,
					},
				},
				profilePic: user.profilePic,
				role: user.role.name,
				status: user.status.name,
				username: user.username,
			},
		})

		return id_user
	}

	async update(user: User): Promise<void> {
		await this.prisma.user.update({
			where: {
				id_user: user.id_user,
			},
			data: {
				email: user.email,
				plan: {
					connectOrCreate: {
						where: {
							id_plan: user.plan.id_plan,
						},
						create: {
							createdAt: new Date(),
							id_plan: user.plan.id_plan,
							name: user.plan.name,
							type: user.plan.type,
							usages: {
								connectOrCreate:
									user.plan instanceof PlanUsage
										? user.plan.usages.data.map(u => ({
												where: { id_usage: u.id_usage },
												create: {
													amountTime: u.amountTime,
													createdAt: new Date(),
													id_usage: u.id_usage,
													accountName: u.accountName,
												},
										  }))
										: [],
							},
						},
					},
				},
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
					connectOrCreate: user.steamAccounts.data.map(sa => ({
						where: { id_steamAccount: sa.id_steamAccount },
						create: {
							accountName: sa.credentials.accountName,
							createdAt: new Date(),
							id_steamAccount: sa.id_steamAccount,
							password: sa.credentials.password,
						},
					})),
				},
			},
		})
	}

	async getByID(userId: string): Promise<User | null> {
		const dbUser = await prismaGetUser(this.prisma, { userId })
		return dbUser ? prismaUserToDomain(dbUser) : null
	}

	async getByUsername(username: string): Promise<User | null> {
		const dbUser = await prismaGetUser(this.prisma, { username })
		return dbUser ? prismaUserToDomain(dbUser) : null
	}
}

export function roleFactory(role: RoleName): Role {
	if (role === "ADMIN") return new AdminRole()
	if (role === "USER") return new UserRole()
	throw new ApplicationError("Invalid role received: " + role)
}

export function statusFactory(status: StatusName): Status {
	if (status === "ACTIVE") return new ActiveStatus()
	if (status === "BANNED") return new BannedStatus()
	throw new ApplicationError("Invalid status received: " + status)
}

export function prismaUserToDomain(dbUser: PrismaGetUser) {
	if (!dbUser) return null
	const steamAccounts: SteamAccountList = new SteamAccountList({
		data: dbUser.steamAccounts.map(sa =>
			SteamAccount.restore({
				credentials: SteamAccountCredentials.restore({
					accountName: sa.accountName,
					password: sa.password,
				}),
				id_steamAccount: sa.id_steamAccount,
				ownerId: dbUser.id_user,
			})
		),
	})

	const userPlan = getCurrentPlanOrCreateOne(dbUser.plan, dbUser.id_user)

	return User.restore({
		email: dbUser.email,
		id_user: dbUser.id_user,
		plan: userPlan,
		profilePic: dbUser.profilePic,
		username: dbUser.username,
		purchases: dbUser.purchases.map(p =>
			Purchase.restore({
				id_Purchase: p.id_Purchase,
			})
		),
		steamAccounts,
		role: roleFactory(dbUser.role),
		status: statusFactory(dbUser.status),
	})
}

export type IGetUserProps = { userId: string } | { username: string }
export type PrismaGetUser = Awaited<ReturnType<typeof prismaGetUser>>
export function prismaGetUser(prisma: PrismaClient, props: IGetUserProps) {
	return prisma.user.findUnique({
		where:
			"username" in props
				? {
						username: props.username,
				  }
				: {
						id_user: props.userId,
				  },
		include: {
			plan: {
				include: {
					usages: true,
				},
			},
			purchases: true,
			steamAccounts: true,
		},
	})
}
