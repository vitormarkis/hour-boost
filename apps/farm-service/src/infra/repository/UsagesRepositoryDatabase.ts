import type { PrismaClient } from "@prisma/client"
import type { Usage, UsagesRepository } from "core"

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
        user_id: usage.user_id,
      },
    })

    return id_usage
  }
}
