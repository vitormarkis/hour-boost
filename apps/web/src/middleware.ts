import { authMiddleware } from "@clerk/nextjs"
import { NextFetchEvent, NextRequest } from "next/server"

export default function (req: NextRequest, event: NextFetchEvent) {
  return authMiddleware({
    publicRoutes: ["/", "/home", "/admin"],
  })(req, event)
}

export const config = {
  matcher: ["/((?!.+\\.[\\w]+$|_next).*)", "/", "/(api|trpc)(.*)"],
}
