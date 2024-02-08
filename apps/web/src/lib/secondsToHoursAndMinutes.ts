export function secondsToHoursAndMinutes(timeInSeconds: number) {
  const hours = Math.floor(timeInSeconds / 3600)
  const minutes = Math.floor((timeInSeconds % 3600) / 60)
  return { hours, minutes }
}
