import { UsagesRepository } from "core"

import { UserCompleteFarmSessionCommand } from "~/application/commands"
import { EventNames, Observer } from "~/infra/queue"

export class PersistUsageHandler implements Observer {
  operation: EventNames = "user-complete-farm-session"

  constructor(private readonly usageRepository: UsagesRepository) {}

  async notify(command: UserCompleteFarmSessionCommand): Promise<void> {
    await this.usageRepository.save(command.usage)

    console.log(`Prisma: ${command.username} farmou ${command.usage.amountTime} segundos.`)
  }
}
