import { CookieOptions, Response } from "express"

export function setCookie(res: Response, key: string, value: string, options = {} as CookieOptions) {
  res.cookie(key, value, {
    domain: process.env.COOKIE_DOMAIN,
    ...options,
  })
  return
}
