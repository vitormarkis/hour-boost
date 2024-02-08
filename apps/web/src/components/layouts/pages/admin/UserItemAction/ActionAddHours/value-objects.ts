export class Minutes {
  private constructor(readonly value: number) {}

  static create(minutes: number) {
    if (minutes < 0 || minutes > 60) {
      return [new Error("Invalid minute.")] as const
    }
    return [undefined, new Minutes(minutes)] as const
  }

  getValue() {
    return this.value.toString()
  }
}

export class Hours {
  private constructor(readonly value: number) {}

  static create(hours: number) {
    if (hours < 0 || hours >= 100) {
      return [new Error("Invalid hour.")] as const
    }
    return [undefined, new Hours(hours)] as const
  }

  getValue() {
    return this.value.toString()
  }
}
