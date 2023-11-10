export interface UserAuthentication {
  getUserByID(userId: string): Promise<IClerkUser>
}

export type IClerkUser = {
  email: string
  id_user: string
  profilePic: string
  username: string
}
