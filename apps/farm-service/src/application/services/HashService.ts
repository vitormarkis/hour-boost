import { DataOrFail, Fail } from "core"
import { nice } from "~/utils/helpers"

interface IHashService {
  encrypt(subject: string): Promise<DataOrFail<Fail, string>>
}

export class HashService implements IHashService {
  async encrypt(subject: string) {
    return nice(subject)
  }
}
