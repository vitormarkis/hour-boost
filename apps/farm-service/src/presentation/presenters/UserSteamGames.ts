export class UserSteamGamesList998 {
  constructor(readonly games: UserSteamGame[]) {}

  toJSON(): UserSteamGame[] {
    return this.games.map(g => ({
      id: g.id,
      imageUrl: g.imageUrl,
    }))
  }
}

export interface UserSteamGame {
  id: number
  imageUrl: string
}
