export class ApplicationError extends Error {
  status: number

  constructor(message: string, status: number = 400) {
    super(message)
    this.status = status
    console.log(this.stack)
  }
}
