import { ApplicationError } from "core/entity"

export type DataOrError<T> = [error: ApplicationError] | [error: null, data: T]
export type DataOrFail<TError = ApplicationError, TData = any> = [error: TError] | [error: null, data: TData]
