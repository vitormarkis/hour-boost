export class MiddlewareResponse<
  const TCode extends string = string,
  const TStatus extends number = number,
  const TJSON extends Record<string, any> = Record<string, any>,
> {
  code: TCode
  status: TStatus
  json: TJSON

  constructor(props: MiddlewareResponseProps<TCode, TStatus, TJSON>) {
    this.code = props.code
    this.status = props.status
    this.json = { ...props.json, code: props.code }
  }

  static create<
    TCode extends string = string,
    TStatus extends number = number,
    TJSON extends Record<string, any> = Record<string, any>,
  >(code: TCode, status: TStatus, json: TJSON) {
    return new MiddlewareResponse({
      code,
      json,
      status,
    })
  }
}

type MiddlewareResponseProps<
  TCode extends string = string,
  TStatus extends number = number,
  TJSON extends Record<string, any> = Record<string, any>,
> = {
  code: TCode
  status: TStatus
  json: TJSON
}
