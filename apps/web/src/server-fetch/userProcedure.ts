import { GenerateNextCommandProps, generateNextCommand } from "@/util/generateNextCommand"
import { getAuth } from "@clerk/nextjs/server"
import { GetServerSideProps } from "next"
import { getUserSession } from "./getUserSession"
import { UserSessionParamsMaybe } from "./types"

export function userProcedure(options: GenerateNextCommandProps<UserSessionParamsMaybe>["options"]) {
  const handler: GetServerSideProps = async ctx => {
    const { getToken } = getAuth(ctx.req)

    const [error, userResponse] = await getUserSession({ getToken })
    if (error) throw error
    const { data, headers } = userResponse

    if (headers["set-cookie"]) {
      ctx.res.setHeader("set-cookie", headers["set-cookie"])
    }

    return generateNextCommand({
      subject: {
        user: data?.userSession ?? null,
        serverHeaders: data?.headers ?? null,
      },
      options,
    })
  }

  return handler
}
