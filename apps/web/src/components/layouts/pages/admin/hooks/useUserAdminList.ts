import { api } from "@/lib/axios"
import { ECacheKeys } from "@/mutations/queryKeys"
import { UseSuspenseQueryOptions, useSuspenseQuery } from "@tanstack/react-query"
import { PlanInfinitySession, PlanUsageSession, UserAdminPanelSession } from "core"

type Options<TData = UserAdminPanelSession[]> = Omit<
  UseSuspenseQueryOptions<UserAdminPanelSession[], Error, TData>,
  "queryKey"
>

type GetAdminUsersListResponse = { usersAdminList: UserAdminPanelSession[]; code: "SUCCESS" }

export function useUserAdminList<TData = UserAdminPanelSession[]>(options = {} as Options<TData>) {
  return useSuspenseQuery<UserAdminPanelSession[], Error, TData>({
    // queryFn: () => getUsersAdminList(Math.random() > 0.5),
    queryFn: async () => {
      const response = await api.get<GetAdminUsersListResponse>("/admin/users-list", {
        withCredentials: true,
      })

      return response.data.usersAdminList
    },
    queryKey: ECacheKeys["USER-ADMIN-ITEM-LIST"],
    staleTime: 1000 * 30,
    refetchInterval: 1000 * 20,
    refetchOnWindowFocus: true,
    ...options,
  })
}

function getUsersAdminList(chance: boolean) {
  return Promise.resolve<UserAdminPanelSession[]>([
    {
      id_user: "33ede51a-6f05-4ee5-969b-334f8c49e2c3",
      username: "josevitor",
      role: "ADMIN",
      profilePicture: "https://avatars.githubusercontent.com/u/121525239?v=4",
      status: "ACTIVE",
      steamAccounts: [
        {
          id_steamAccount: "1331edfd-6243-41d2-a27f-7ee96531da80",
          accountName: "wesleymonteiro",
          autoRelogin: false,
          farmedTimeInSeconds: 22236,
          farmingGames: [70],
          farmStartedAt: new Date(1707513913828).toISOString(),
          profilePictureUrl:
            "https://steamcdn-a.akamaihd.net/steamcommunity/public/images/avatars/0b/0b1efee9f2cbdf55d47d0cb6ed955c8ebfa057d3_medium.jpg",
          stagingGames: [],
          status: chance ? "offline" : "online",
          games: [
            {
              id: 70,
              imageUrl: "https://cdn.akamai.steamstatic.com/steam/apps/70/header.jpg?t=70",
              name: "Half-Life",
            },
            {
              id: 130,
              imageUrl: "https://cdn.akamai.steamstatic.com/steam/apps/130/header.jpg?t=130",
              name: "Half-Life: Blue Shift",
            },
            {
              id: 730,
              imageUrl: "https://cdn.akamai.steamstatic.com/steam/apps/730/header.jpg?t=730",
              name: "Counter-Strike 2",
            },
          ],
        },
        {
          id_steamAccount: "294nis9n-6f05-4ee5-969b-334f8c49e2c3",
          accountName: "chapilson2",
          autoRelogin: false,
          farmedTimeInSeconds: 62736,
          farmingGames: chance ? [10, 130, 30] : [30],
          farmStartedAt: new Date(1706741221314).toISOString(),
          profilePictureUrl:
            "https://steamcdn-a.akamaihd.net/steamcommunity/public/images/avatars/0a/0a1a2e5126ab9ffe32d3132884d910a2c7421e5f_medium.jpg",
          stagingGames: [10, 130, 20, 30, 40, 50, 60, 70, 730],
          status: "online",
          games: [
            {
              id: 10,
              imageUrl: "https://cdn.akamai.steamstatic.com/steam/apps/10/header.jpg?t=10",
              name: "Counter-Strike",
            },
            {
              id: 20,
              imageUrl: "https://cdn.akamai.steamstatic.com/steam/apps/20/header.jpg?t=20",
              name: "Team Fortress Classic",
            },
            {
              id: 30,
              imageUrl: "https://cdn.akamai.steamstatic.com/steam/apps/30/header.jpg?t=30",
              name: "Day of Defeat",
            },
            {
              id: 40,
              imageUrl: "https://cdn.akamai.steamstatic.com/steam/apps/40/header.jpg?t=40",
              name: "Deathmatch Classic",
            },
            {
              id: 50,
              imageUrl: "https://cdn.akamai.steamstatic.com/steam/apps/50/header.jpg?t=50",
              name: "Half-Life: Opposing Force",
            },
            {
              id: 60,
              imageUrl: "https://cdn.akamai.steamstatic.com/steam/apps/60/header.jpg?t=60",
              name: "Ricochet",
            },
            {
              id: 70,
              imageUrl: "https://cdn.akamai.steamstatic.com/steam/apps/70/header.jpg?t=70",
              name: "Half-Life",
            },
            {
              id: 130,
              imageUrl: "https://cdn.akamai.steamstatic.com/steam/apps/130/header.jpg?t=130",
              name: "Half-Life: Blue Shift",
            },
            {
              id: 730,
              imageUrl: "https://cdn.akamai.steamstatic.com/steam/apps/730/header.jpg?t=730",
              name: "Counter-Strike 2",
            },
          ],
        },
      ],
      plan: {
        maxGamesAllowed: 1,
        maxSteamAccounts: 2,
        id_plan: "d4ef6551-64c5-42e5-972e-404ab65dd563",
        autoRestarter: false,
        name: "DIAMOND",
        type: "INFINITY",
      } satisfies PlanInfinitySession,
      purchases: [
        {
          id_Purchase: "ec768f0f-223a-4b6d-b06b-76200fc6019e",
          when: new Date("2023-12-31T10:00:00.000Z").toISOString(),
          valueInCents: 2700,
          type: {
            name: "TRANSACTION-PLAN",
            from: {
              planType: "GUEST",
            },
            to: {
              planType: "GOLD",
            },
          },
        },
        {
          id_Purchase: "5634b221-3906-4585-bcea-62f78d9bb76f",
          when: new Date("2024-01-26T17:00:00.000Z").toISOString(),
          valueInCents: 2150,
          type: {
            name: "TRANSACTION-PLAN",
            from: {
              planType: "GOLD",
            },
            to: {
              planType: "DIAMOND",
            },
          },
        },
      ],
    },
    {
      id_user: "21f8e4d7-0b05-4af3-8cd1-11f1ce3455ff",
      username: "felipedeschamps",
      role: "USER",
      profilePicture: "https://avatars.githubusercontent.com/u/4248081?v=4",
      steamAccounts: [
        {
          id_steamAccount: "d4ef6551-64c5-42e5-972e-404ab65dd562",
          accountName: "darkrider360",
          autoRelogin: false,
          farmedTimeInSeconds: 9999,
          farmingGames: chance ? [20, 30] : [],
          farmStartedAt: new Date(1707513913828).toISOString(),
          profilePictureUrl:
            "https://steamcdn-a.akamaihd.net/steamcommunity/public/images/avatars/6c/6c3f45ebe83fb17a896669f2e0e99d0f2cd7d73b_medium.jpg",
          stagingGames: [20, 30, 40, 60],
          status: "online",
          games: [
            {
              id: 20,
              imageUrl: "https://cdn.akamai.steamstatic.com/steam/apps/20/header.jpg?t=20",
              name: "Team Fortress Classic",
            },
            {
              id: 30,
              imageUrl: "https://cdn.akamai.steamstatic.com/steam/apps/30/header.jpg?t=30",
              name: "Day of Defeat",
            },
            {
              id: 40,
              imageUrl: "https://cdn.akamai.steamstatic.com/steam/apps/40/header.jpg?t=40",
              name: "Deathmatch Classic",
            },
            {
              id: 50,
              imageUrl: "https://cdn.akamai.steamstatic.com/steam/apps/50/header.jpg?t=50",
              name: "Half-Life: Opposing Force",
            },
            {
              id: 60,
              imageUrl: "https://cdn.akamai.steamstatic.com/steam/apps/60/header.jpg?t=60",
              name: "Ricochet",
            },
            {
              id: 130,
              imageUrl: "https://cdn.akamai.steamstatic.com/steam/apps/130/header.jpg?t=130",
              name: "Half-Life: Blue Shift",
            },
          ],
        },
      ],

      plan: {
        maxGamesAllowed: 32,
        maxSteamAccounts: 1,
        maxUsageTime: 3600 * 6,
        id_plan: "102f5f6d-42d6-4433-ae72-189e2a43a885",
        autoRestarter: false,
        farmUsedTime: 0,
        name: "GUEST",
        type: "USAGE",
      } satisfies PlanUsageSession,
      purchases: [],
      status: "ACTIVE",
    },
    {
      id_user: "21f8e4d7-0b05-4af3-8cd1-11f1ce3455ff2",
      username: "dwilt",
      role: "USER",
      profilePicture: "https://github.com/dwilt.png",
      steamAccounts: [],

      plan: {
        maxGamesAllowed: 1,
        maxSteamAccounts: 2,
        maxUsageTime: 7200,
        id_plan: "6db79cee-2f1c-4fff-a08a-9437a35daeed",
        autoRestarter: false,
        farmUsedTime: 0,
        name: "GUEST",
        type: "USAGE",
      } satisfies PlanUsageSession,
      purchases: [],
      status: "ACTIVE",
    },
    {
      id_user: "21f8e4d7-0b05-4af3-8cd1-11f1ce3455ff1",
      username: "OmerCohenAviv",
      role: "USER",
      profilePicture: "https://github.com/OmerCohenAviv.png",
      steamAccounts: [],

      plan: {
        maxGamesAllowed: 1,
        maxSteamAccounts: 2,
        maxUsageTime: 7200,
        id_plan: "f6a9727b-f226-4021-abdb-f38446305980",
        autoRestarter: false,
        farmUsedTime: 0,
        name: "GUEST",
        type: "USAGE",
      } satisfies PlanUsageSession,
      purchases: [],
      status: "ACTIVE",
    },
  ])
}
