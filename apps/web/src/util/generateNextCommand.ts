import { GetServerSidePropsResult } from "next"

type Options<T> = Partial<{
  shouldShowNotFoundPageWhen(subject: T): boolean | undefined
  shouldRedirectToPathIf(subject: T): string | undefined
}>

export type GenerateNextCommandProps<T> = {
  subject: T
  options?: Options<T>
}

export async function generateNextCommand<T>({
  subject,
  options = {},
}: GenerateNextCommandProps<T>): Promise<GetServerSidePropsResult<T>> {
  const pathToRedirect = options.shouldRedirectToPathIf?.(subject)
  if (pathToRedirect) {
    return {
      redirect: {
        destination: pathToRedirect,
        permanent: false,
      },
    }
  }

  if (options.shouldShowNotFoundPageWhen?.(subject)) {
    return {
      notFound: true,
    }
  }

  return {
    props: subject,
  }
}
