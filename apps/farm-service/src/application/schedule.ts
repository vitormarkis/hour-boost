import { AutoRestartCron } from "~/application/cron/AutoRestartCron"
import { ScheduleAutoRestartUseCase } from "~/application/use-cases"
import { AutoRestarterScheduler } from "~/domain/cron"
import { bad, nice } from "~/utils/helpers"

export async function scheduleVersale({
  intervalInSeconds,
  autoRestarterScheduler,
  autoRestartCron,
  accountName,
}: {
  accountName: string
  autoRestartCron: AutoRestartCron
  autoRestarterScheduler: AutoRestarterScheduler
  intervalInSeconds: number
}) {
  return nice(
    `Agendando um auto restarter para [${accountName}] para rodar num intervalo de ${intervalInSeconds} segundos.`
  )
}
