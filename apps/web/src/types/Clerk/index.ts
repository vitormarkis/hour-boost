import { useAuth } from "@clerk/clerk-react"

export type GetToken = ReturnType<typeof useAuth>["getToken"]
