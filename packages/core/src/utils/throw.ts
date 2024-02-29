export function makeError(message: string, payload?: any) {
  console.log(`NSTH: ${message}`, payload)
  return new Error(message)
}
