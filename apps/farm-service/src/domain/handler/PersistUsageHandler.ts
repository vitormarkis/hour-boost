import { UsagesRepository } from "core"

import { EventNames } from "~/domain/service"
import { UserCompleteFarmSessionCommand } from "~/application/commands"
import { Observer } from "~/infra/queue"

export class PersistUsageHandler implements Observer {
  constructor(private readonly usageRepository: UsagesRepository) {}

  async notify(command: UserCompleteFarmSessionCommand): Promise<void> {
    await this.usageRepository.save(command.usage)

    console.log(`Prisma: ${command.usageLeft / 60 / 60} horas restantes.`)
    console.log(`Prisma: ${command.username} farmou ${command.usage.amountTime} segundos.`)
  }
  operation: EventNames = "user-complete-farm-session"
}
