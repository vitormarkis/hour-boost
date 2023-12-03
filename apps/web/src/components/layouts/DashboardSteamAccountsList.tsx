import React from "react"
import { cn } from "@/lib/utils"
import { SteamAccountListItem } from "@/components/molecules/SteamAccountListItem"
import { UserSession } from "core"

export type DashboardSteamAccountsListProps = React.ComponentPropsWithoutRef<"section"> & {
	user: UserSession
}

export const DashboardSteamAccountsList = React.forwardRef<
	React.ElementRef<"section">,
	DashboardSteamAccountsListProps
>(function DashboardSteamAccountsListComponent({ user, className, ...props }, ref) {
	// const { getToken } = useAuth()

	// const {
	//   data,
	//   error: errorSteamAccounts,
	//   isLoading: isLoadingSteamAccounts,
	// } = useQuery<API_GET_SteamAccounts>({
	//   queryKey: ["steam-accounts", user.id_user],
	//   queryFn: async () => {
	//     try {
	//       const response = await api.get<API_GET_SteamAccounts>("/steam-accounts", {
	//         headers: {
	//           Authorization: `Bearer ${await getToken()}`,
	//         },
	//       })

	//       return response.data
	//     } catch (error) {
	//       console.log(error)
	//       if (error instanceof AxiosError) {
	//         throw new Error(error.message)
	//       }
	//       throw error
	//     }
	//   },
	//   staleTime: 1000 * 60, // 1 minute
	// })

	const errorSteamAccounts = null
	const isLoadingSteamAccounts = false
	const data = {
		steamAccounts: [
			{
				accountName: "gold1",
				games: [],
				id_steamAccount: "2c688339-d4fb-454e-a40e-16c773077a13",
			},
			{
				accountName: "gold2",
				games: [],
				id_steamAccount: "2f225aef-af7b-4ed8-9df1-8d9ecbaaba28",
			},
		],
	}

	if (errorSteamAccounts) {
		return (
			<section {...props} className={cn("flex flex-col gap-2", className)} ref={ref}>
				<span className="text-red-700">Ocorreu um erro ao buscar suas contas da Steam.</span>
			</section>
		)
	}

	if (!data || isLoadingSteamAccounts) {
		return (
			<section {...props} className={cn("flex flex-col gap-2", className)} ref={ref}>
				<span>Carregando suas contas da Steam...</span>
			</section>
		)
	}

	const { steamAccounts } = data

	if (steamAccounts.length === 0) {
		return (
			<section {...props} className={cn("flex flex-col gap-2", className)} ref={ref}>
				<span>Você ainda não cadastrou nenhuma conta Steam!</span>
			</section>
		)
	}

	return (
		<section {...props} className={cn("flex flex-col gap-2 p-2", className)} ref={ref}>
			{/* {steamAccounts.map(steamAccount => ( */}
			<SteamAccountListItem
				userId={user.id_user}
				accountPicture="https://avatars.akamai.steamstatic.com/6461f416b7ff00e9205c539429e8a2aab7531512_full.jpg"
				plan={user.plan}
				header
				// key={steamAccount.accountName}
			/>
			<SteamAccountListItem
				userId={user.id_user}
				accountPicture="https://avatars.cloudflare.steamstatic.com/2ec38f7a0953fe2585abdda0757324dbbb519749_full.jpg"
				plan={user.plan}
				isFarming
				// key={steamAccount.accountName}
			/>
			<SteamAccountListItem
				userId={user.id_user}
				accountPicture="https://avatars.akamai.steamstatic.com/92e0f1eff7d30d4cb80322fc4dad4063b5374e5c_full.jpg"
				plan={user.plan}
				steamGuard
				// isFarming
				// key={steamAccount.accountName}
			/>
			{/* ))} */}
		</section>
	)
})

DashboardSteamAccountsList.displayName = "DashboardSteamAccountsList"
