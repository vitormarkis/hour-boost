import { HashService } from "~/application/services/HashService"

test("should not return the same string", async () => {
  const hashService = new HashService()
  const [error, result] = hashService.encrypt("123")
  expect(error).toBeNull()
  expect(result).not.toBe("123")
})

test("should compare subject and hashed subject", async () => {
  const hashService = new HashService()
  const [_1, result] = hashService.encrypt("123")
  expect(_1).toBeNull()

  const [, decrypted_A] = hashService.decrypt(result)
  const [, decrypted_B] = hashService.decrypt("abc")
  const [, decrypted_C] = hashService.decrypt("999")
  expect(decrypted_A).toBe("123")
  expect(decrypted_B).not.toBe("123")
  expect(decrypted_C).not.toBe("123")
})
