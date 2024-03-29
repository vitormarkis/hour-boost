import type { IClerkUser, UserAuthentication } from "core"
import type { ClerkClient } from "node_modules/@clerk/clerk-sdk-node/dist/types/types"

export class ClerkAuthentication implements UserAuthentication {
  constructor(private readonly clerkClient: ClerkClient) {}

  async getUserByID(userId: string): Promise<IClerkUser> {
    const clerkUser = await this.clerkClient.users.getUser(userId)
    return {
      email: clerkUser.emailAddresses[0].emailAddress,
      id_user: clerkUser.id,
      profilePic: clerkUser.imageUrl,
      username: clerkUser.username ?? `guest_${Math.random().toString(36).substring(2, 12)}`,
    }
  }
}
