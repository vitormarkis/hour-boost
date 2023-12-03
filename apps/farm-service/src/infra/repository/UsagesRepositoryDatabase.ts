import { PrismaClient } from "@prisma/client"
import { Usage, UsagesRepository } from "core"

export class UsagesRepositoryDatabase implements UsagesRepository {
	constructor(private readonly prisma: PrismaClient) {}

	async save(usage: Usage): Promise<string> {
		const { id_usage } = await this.prisma.usage.create({
			data: {
				amountTime: usage.amountTime,
				createdAt: usage.createdAt,
				id_usage: usage.id_usage,
				plan_id: usage.plan_id,
				accountName: usage.accountName,
			},
		})

		return id_usage
	}
}
