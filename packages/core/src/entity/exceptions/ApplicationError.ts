export class ApplicationError extends Error {
  status: number
  details: any

  constructor(message: string, status: number = 400, details?: any) {
    super(message)
    this.status = status
    this.details = details
    console.log(`DETAILS: `, details)
    console.log(this.stack)
  }
}
