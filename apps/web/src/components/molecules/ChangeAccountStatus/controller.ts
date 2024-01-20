import { AppAccountStatus } from "core"

export interface ChangeAccountStatusPayload {
  accountName: string
  status: AppAccountStatus
}
