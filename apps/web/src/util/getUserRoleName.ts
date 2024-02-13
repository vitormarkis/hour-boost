import { RoleName } from "core"

export function getRoleName(planName: RoleName): string {
  const roleNamesMapper: Record<RoleName, string> = {
    ADMIN: "Administrador",
    USER: "Usuário",
  }

  return roleNamesMapper[planName]
}
