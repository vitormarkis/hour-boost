import { getUserSession } from "@/server-fetch/getUserSession"
import { ServerHeaders } from "@/server-fetch/server-headers"
import { UserSessionParams } from "@/server-fetch/types"
import { generateNextCommand } from "@/util/generateNextCommand"
import { getAuth } from "@clerk/nextjs/server"
import axios, { AxiosError } from "axios"
import { GetServerSideProps } from "next"
import { useEffect, useState } from "react"

export const getServerSideProps: GetServerSideProps = async ctx => {
  const serverHeaders = new ServerHeaders(ctx)
  serverHeaders.appendAuthorization()

  const { getToken } = getAuth(ctx.req)
  const [error, userSessionResponse] = await getUserSession({ getToken })
  if (error) throw error.message
  const { data, headers } = userSessionResponse

  if (headers["set-cookie"]) ctx.res.setHeader("set-cookie", headers["set-cookie"])

  const command = await generateNextCommand({
    subject: {
      user: data?.userSession,
      serverHeaders: serverHeaders.toJSON(),
    },
    options: {
      shouldShowNotFoundPageWhen({ user }) {
        return user?.role !== "ADMIN"
      },
    },
  })
  return command
}

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
})

export default function Cookies({ user }: UserSessionParams) {
  const [clientResponse, setClientResponse] = useState<{ statusCode: number; data: any }>({
    data: null,
    statusCode: 0,
  })

  useEffect(() => {
    api
      .get("/admin/users-list")
      .then(res => {
        setClientResponse({
          data: res.data,
          statusCode: res.status,
        })
      })
      .catch((error: AxiosError) => {
        setClientResponse({
          data: error.response?.data,
          statusCode: error.response?.status ?? 9,
        })
      })
    // fetch(`${process.env["NEXT_PUBLIC_API_URL"]}/me`, {
    //   credentials: "include",
    //   // mode: "cors",
    // })
    //   .then(res => res.json())
    //   .then(setClientResponse)
    //   .catch(setClientError)
  }, [])

  return (
    <>
      {/* // <UserProvider serverUser={user}> */}
      <pre className="bg-emerald-400 p-2 text-black">{JSON.stringify({ clientResponse }, null, 2)}</pre>
      <pre className="bg-indigo-200 p-2 text-black">{JSON.stringify({ serverUser: user }, null, 2)}</pre>
      {/* // </UserProvider> */}
    </>
  )
}
