import { authMiddleware } from "@clerk/nextjs"
import { NextFetchEvent, NextRequest, NextResponse } from "next/server"

export default function (req: NextRequest, event: NextFetchEvent) {
  // if (process.env.NODE_ENV === "development" || req.nextUrl.pathname === "/dashboard") {
  //   return NextResponse.next()
  // }

  // // Otherwise, apply the authMiddleware
  if (req.nextUrl.pathname === "/cookies") {
    console.log({ pathname: req.nextUrl.pathname })
    // return NextResponse.next()
  }

  return authMiddleware({
    publicRoutes: ["/", "/home", "/admin"],
    debug: true,
  })(req, event)
}

export const config = {
  matcher: ["/((?!.+\\.[\\w]+$|_next).*)", "/", "/(api|trpc)(.*)"],
}
