export class Logger {
  constructor(
    private readonly prefix: string,
    private readonly shouldLog = true
  ) {}

  log(...args: any[]) {
    if (this.shouldLog) console.log(`[${this.prefix}] `, ...args)
  }
}
