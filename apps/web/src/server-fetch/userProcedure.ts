import { GenerateNextCommandProps, generateNextCommand } from "@/util/generateNextCommand"
import { GetServerSideProps } from "next"
import { getUserSession } from "./getUserSession"
import { ServerHeaders } from "./server-headers"
import { UserSessionParamsBroad } from "./types"
import { getAuth } from "@clerk/nextjs/server"

export function userProcedure(options: GenerateNextCommandProps<UserSessionParamsBroad>["options"]) {
  const handler: GetServerSideProps = async ctx => {
    const serverHeaders = new ServerHeaders(ctx)
    serverHeaders.appendAuthorization()
    const { getToken } = getAuth(ctx.req)

    const [error, userSessionResponse] = await getUserSession({ getToken })
    if (error) {
      console.log("ssr error: ", error)
      throw error
    }
    const { data, headers } = userSessionResponse

    if (headers["set-cookie"]) ctx.res.setHeader("set-cookie", headers["set-cookie"])

    return generateNextCommand({
      subject: {
        user: data?.userSession ?? null,
        serverHeaders: serverHeaders.toJSON(),
      },
      options,
    })
  }

  return handler
}
