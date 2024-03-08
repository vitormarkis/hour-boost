import type { ensureAdmin } from "./ensureAdmin"

export namespace Middlewares {
  export type EnsureAdmin = typeof ensureAdmin
}
