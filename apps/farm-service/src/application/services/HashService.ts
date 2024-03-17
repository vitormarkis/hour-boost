import { DataOrFail, Fail } from "core"
import crypto from "secure-encrypt"
import { env } from "~/env"
import { nice } from "~/utils/helpers"

interface IHashService {
  encrypt(subject: string): DataOrFail<Fail, string>
  decrypt(encryptedString: string): DataOrFail<Fail, string>
}

export class HashService implements IHashService {
  encrypt(subject: string) {
    const encryptedSubject = crypto.encrypt(subject, env.HASH_SECRET)
    return nice(encryptedSubject)
  }

  decrypt(encryptedString: string) {
    const encryptedSubject = crypto.decrypt(encryptedString, env.HASH_SECRET)
    return nice(encryptedSubject)
  }
}
