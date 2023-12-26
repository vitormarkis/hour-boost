export class Logger {
  constructor(private readonly prefix: string) {}

  log(...args: any[]) {
    console.log(`[${this.prefix}] `, ...args)
  }
}
