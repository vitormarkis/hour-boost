import { api } from "@/lib/axios"
import { GetMeResponse } from "@/pages/dashboard"
import { safer } from "./safer"

type GetUserSession = {
  headers: object
}

export async function getUserSession({ headers }: GetUserSession) {
  return safer(() =>
    api.get<GetMeResponse | null>("/me", {
      headers,
      // withCredentials: true,
    })
  )
}
