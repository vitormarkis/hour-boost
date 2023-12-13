import { SteamAccountClient } from "~/application/services/steam"
import { Publisher } from "~/infra/queue"
import { EventEmitterBuilder } from "~/utils/builders"
import { Builder, SteamClientBuilder } from "~/utils/builders/builder.interface"

export class SteamAccountClientBuilder implements Builder<SteamAccountClient> {
  constructor(
    private readonly emitterBuilder: EventEmitterBuilder,
    private readonly publisher: Publisher,
    private readonly steamUserBuilder: SteamClientBuilder
  ) {}

  create({ accountName, userId, username }: CreateSteamAccountClient): SteamAccountClient {
    return new SteamAccountClient({
      instances: {
        emitter: this.emitterBuilder.create(),
        publisher: this.publisher,
      },
      props: {
        accountName,
        client: this.steamUserBuilder.create(),
        userId,
        username,
      },
    })
  }
}

type CreateSteamAccountClient = {
  accountName: string
  userId: string
  username: string
}
