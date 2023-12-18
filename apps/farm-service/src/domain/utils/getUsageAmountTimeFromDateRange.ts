export function getUsageAmountTimeFromDateRange(startedAt: Date, finishedAt: Date) {
  return (finishedAt.getTime() - startedAt.getTime()) / 1000
}
