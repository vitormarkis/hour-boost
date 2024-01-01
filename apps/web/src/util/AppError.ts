export class AppError {
  constructor(
    readonly message: string,
    readonly tone: "IMPORTANT" | "ERROR" | "WARNING" = "WARNING"
  ) {}
}

export type DataOrError<T = any> = [error: AppError, data: null] | [error: null, data: T]
