import type { IClerkUser, UserAuthentication } from "core"

const makePlayingSession = () => {
  const playingSession = [] as string[]
  function setPlayingSession(newValues: string[]): void
  function setPlayingSession(newValues: (newValues: string[]) => string[]): void
  function setPlayingSession(valuesOrCallback: unknown) {
    const newValuesImpl = Array.isArray(valuesOrCallback)
      ? (valuesOrCallback as string[])
      : (valuesOrCallback as (newValues: string[]) => string[])(playingSession)
    playingSession.splice(0, playingSession.length)
    for (const i of newValuesImpl) {
      playingSession.push(i)
    }
  }
  return [playingSession, setPlayingSession] as const
}

export const [playingSession, setPlayingSession] = makePlayingSession()
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
