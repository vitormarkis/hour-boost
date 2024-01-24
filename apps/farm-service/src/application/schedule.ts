import { ScheduleAutoRelogin } from "~/domain/cron/auto-relogin"
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
  const scheduleAutoRelogin = new ScheduleAutoRelogin(autoReloginScheduler, restoreAccountSessionUseCase)

  const [error] = await scheduleAutoRelogin.execute({
    accountName,
    intervalInSeconds,
  })
  if (error) return fail(error)

  return nice(
    `Agendando um auto relogin para [${accountName}] para rodar num intervalo de ${intervalInSeconds} segundos.`
  )
}
