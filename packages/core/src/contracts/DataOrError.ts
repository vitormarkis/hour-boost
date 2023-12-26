import { ApplicationError } from "core/entity"

export type DataOrError<T> = [error: ApplicationError, data: null] | [error: null, data: T]
