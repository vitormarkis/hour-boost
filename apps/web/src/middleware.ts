import { authMiddleware } from "@clerk/nextjs"
import { NextFetchEvent, NextRequest, NextResponse } from "next/server"

export default function (req: NextRequest, event: NextFetchEvent) {
  // if (process.env.NODE_ENV === "development" || req.nextUrl.pathname === "/dashboard") {
  //   return NextResponse.next()
  // }

  // // Otherwise, apply the authMiddleware
  return authMiddleware({
    publicRoutes: ["/", "/home"],
  })(req, event)
}

export const config = {
  matcher: ["/((?!.+\\.[\\w]+$|_next).*)", "/(api|trpc)(.*)"],
}
