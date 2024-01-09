import { IClerkUser, UserAuthentication } from "core"

export class UserAuthenticationInMemory implements UserAuthentication {
  async getUserByID(userId: string): Promise<IClerkUser> {
    const userTest = testUsersMapper[userId]
    return Promise.resolve({
      email: "",
      id_user: userId,
      profilePic: "",
      username: userTest.username,
    })
  }
}

export type TestUsers = "me" | "friend"

export type TestUserProperties = {
  userId: string
  username: string
  accountName: string
  accountName2: string
  accountName3: string
}

export const testUsers: Record<TestUsers, TestUserProperties> = {
  me: {
    userId: "id_123",
    username: "user_vrsl",
    accountName: "paco",
    accountName2: "bane",
    accountName3: "plan",
  },
  friend: {
    userId: "id_f_123",
    username: "user_mathew",
    accountName: "fred",
    accountName2: "noka",
    accountName3: "urto",
  },
} as const

const testUsersMapper = Object.entries(testUsers).reduce(
  (acc, [prefix, userInfo]) => {
    acc[userInfo.userId] = userInfo
    return acc
  },
  {} as Record<string, TestUserProperties>
)
