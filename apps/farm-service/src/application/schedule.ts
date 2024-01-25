import { ScheduleAutoReloginUseCase } from "~/application/use-cases/ScheduleAutoReloginUseCase"
import { fail, nice } from "~/utils/helpers"

export async function scheduleVersale({
  intervalInSeconds,
  autoReloginScheduler,
  restoreAccountSessionUseCase,
  accountName,
}: {
  accountName: string
  autoReloginScheduler: any
  restoreAccountSessionUseCase: any
  intervalInSeconds: number
}) {
  const scheduleAutoReloginUseCase = new ScheduleAutoReloginUseCase(
    autoReloginScheduler,
    restoreAccountSessionUseCase
  )

  const [error] = await scheduleAutoReloginUseCase.execute({
    accountName,
    intervalInSeconds,
  })
  if (error) return fail(error)

  return nice(
    `Agendando um auto relogin para [${accountName}] para rodar num intervalo de ${intervalInSeconds} segundos.`
  )
}
