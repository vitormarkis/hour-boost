import { toast } from "sonner"

export class MessageMaker<TCode extends string | "UNKNOWN" = "UNKNOWN"> {
  new(message: string, type: Type, code?: TCode | "UNKNOWN") {
    return new Message<TCode | "UNKNOWN">(message, type, code)
  }
}

export class Message<TCode extends string | "UNKNOWN" = "UNKNOWN"> {
  readonly code: TCode | "UNKNOWN"

  constructor(
    readonly message: string,
    readonly type: Type,
    code?: TCode | "UNKNOWN"
  ) {
    this.code = code ? code : ("UNKNOWN" as TCode | "UNKNOWN")
  }
}

export type DataOrMessage<TData, TCode extends string | "UNKNOWN" = "UNKNOWN"> =
  | [undesired: Message<TCode | "UNKNOWN">, data: null]
  | [undesired: null, data: TData]

type Type = Exclude<keyof typeof toast, "custom" | "promise">
