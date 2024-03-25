import { type DataOrFail, Fail } from "core"
import { SessionRestart } from "~/application/use-cases/RestoreAccountManySessionsUseCase"
import { sleep } from "~/utils"
import { bad, nice } from "~/utils/helpers"
import { range } from "~/utils/range"

export type ExecutePromisesInBatchProps<T extends DataOrFail<Fail> = DataOrFail<Fail>> = {
  promiseList: SessionRestart[]
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
  console.log(`Restaurando [${performingList.map(p => p.accountName).join(", ")}]`)
  console.log(`Ainda faltam [${itering.map(p => p.accountName).join(", ")}]`)
  await Promise.all(
    performingList.map(p =>
      sleep(range(0, noiseInSeconds)).then(() => {
        return p.getPromise()
      })
    )
  )
  if (promiseList.length === 0) return bad(Fail.create("LIST-LENGTH-IS-EMPTY", 400))
  await sleep(intervalInSeconds)
  await executePromisesInBatch({ promiseList: itering, batchAmount, intervalInSeconds, noiseInSeconds })
  return nice()
}
