import { env } from "~/env"

async function main() {
  const headers = new Headers()
  headers.append("content-type", "application/json")
  const response = await fetch(env.STOP_ENDPOINT as string, {
    headers,
    method: "POST",
    body: `{"secret":"${env.SECRET}"}`,
  })
  const data = await response.json()
  console.log(data)
}

main()
