export abstract class Role {
  abstract name: RoleName
}

export type RoleName = "ADMIN" | "USER"
