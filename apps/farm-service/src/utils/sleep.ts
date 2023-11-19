export function sleep(timeInSeconds: number) {
  return new Promise(res => setTimeout(res, timeInSeconds * 1000).unref())
}
