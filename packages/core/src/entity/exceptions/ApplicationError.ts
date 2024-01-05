export class ApplicationError extends Error {
  status: number
  details: any
  code?: string

  constructor(message: string, status: number = 400, details?: any, code?: string) {
    super(message)
    this.status = status
    this.details = details
    this.code = code
    console.log(`DETAILS: `, details)
    console.log(this.stack)
  }
}
