import { CookieOptions, Response } from "express"
import { env } from "~/env"

export function setCookie(res: Response, key: string, value: string, options = {} as CookieOptions) {
  res.cookie(key, value, {
    domain: env.COOKIE_DOMAIN,
    ...options,
  })
  return
}
