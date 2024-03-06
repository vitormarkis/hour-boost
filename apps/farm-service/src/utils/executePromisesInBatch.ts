import { DataOrFail, Fail, GetError, GetResult } from "core"
import { sleep } from "~/utils"
import { GetErrorByTuple, GetResultByTuple, bad, nice, only } from "~/utils/helpers"
import { range } from "~/utils/range"

export type ExecutePromisesInBatchProps<T extends DataOrFail<Fail> = DataOrFail<Fail>> = {
  promiseList: Array<() => Promise<T>>
  batchAmount: number
  noiseInSeconds: number
  intervalInSeconds: number
}

export async function executePromisesInBatch<T extends DataOrFail<Fail> = DataOrFail<Fail>>({
  noiseInSeconds,
  batchAmount,
  intervalInSeconds,
  promiseList,
}: ExecutePromisesInBatchProps<T>) {
  if (promiseList.length === 0) return bad(Fail.create("LIST-LENGTH-IS-EMPTY", 400))
  const itering = [...promiseList]
  const performingList = itering.splice(0, batchAmount)
  await Promise.all(performingList.map(p => sleep(range(0, noiseInSeconds)).then(() => p())))
  if (promiseList.length === 0) return bad(Fail.create("LIST-LENGTH-IS-EMPTY", 400))
  await sleep(intervalInSeconds)
  await executePromisesInBatch({ promiseList: itering, batchAmount, intervalInSeconds, noiseInSeconds })
  return nice()
}
