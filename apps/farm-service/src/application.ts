import SteamUser from "steam-user"

export class Application {
    users: Map<string, SteamUser> = new Map()

    appendUser(username: string, user: SteamUser) {
        this.users.set(username, user)
    }

    removeUser(username: string) {
        this.users.delete(username)
    }

    getUser(username: string) {
        return this.users.get(username)
    }
}
