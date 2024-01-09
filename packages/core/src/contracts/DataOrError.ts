import { ApplicationError } from "core/entity"

export type DataOrError<T> = [error: ApplicationError] | [error: null, data: T]
