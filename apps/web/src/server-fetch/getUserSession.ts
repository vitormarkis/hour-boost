import { api } from "@/lib/axios"
import { GetMeResponse } from "@/pages/dashboard"
import { safer } from "./safer"

type GetUserSession = {
  getToken(): Promise<string | null>
}

export async function getUserSession({ getToken }: GetUserSession) {
  return safer(async () =>
    api.get<GetMeResponse | null>("/me", {
      headers: {
        Authorization: `Bearer ${await getToken()}`,
      },
    })
  )
}

// export const getServerSideProps: GetServerSideProps = async ctx => {
//   const { getToken } = getAuth(ctx.req)
//   const response = await api.get<GetMeResponse | null>("/me", {
//     headers: {},
//   })

//   return {
//     props: {
//       user: response.data?.userSession ?? null,
//     },
//   }
// }
