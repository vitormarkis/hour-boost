import { ApplicationError } from "core/entity/exceptions"
import { SteamAccount } from "core/entity"

export class SteamAccountList {
  readonly data: SteamAccount[]
  readonly trash: SteamAccount[]

  constructor(props: SteamAccountListProps = {}) {
    this.data = props.data ?? []
    this.trash = props.trash ?? []
  }

  add(steamAccount: SteamAccount) {
    this.data.push(steamAccount)
  }

  remove(steamAccountID: string) {
    const steamAccountIndex = this.data.findIndex(u => u.id_steamAccount === steamAccountID)
    if (steamAccountIndex === -1)
      throw new ApplicationError("Falha ao remover Steam Account. Steam Account não encontrada.", 404)
    this.trash.push(this.data[steamAccountIndex])
    this.data.splice(steamAccountIndex, 1)
  }

  getByAccountName(accountName: string) {
    return this.data.find(sa => sa.credentials.accountName === accountName) ?? null
  }

  getAmount() {
    return this.data.length
  }

  getTrashIDs() {
    return this.trash.map(sa => sa.id_steamAccount)
  }

  getIDs() {
    return this.data.map(sa => sa.id_steamAccount)
  }
}

export interface SteamAccountListProps {
  data?: SteamAccount[]
  trash?: SteamAccount[]
}

export interface SteamAccountListCreateProps {}
