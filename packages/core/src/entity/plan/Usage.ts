import { makeID } from "../../entity/generateID"

export class Usage {
  readonly id_usage: string
  readonly createdAt: Date
  readonly amountTime: number
  readonly plan_id: string

  private constructor(props: UsageProps) {
    this.id_usage = props.id_usage
    this.createdAt = props.createdAt
    this.amountTime = props.amountTime
    this.plan_id = props.plan_id
  }

  static create(props: UsageCreateProps) {
    return new Usage({
      ...props,
      id_usage: makeID(),
    })
  }

  static restore(props: UsageProps) {
    return new Usage(props)
  }
}

export interface UsageProps {
  id_usage: string
  createdAt: Date
  amountTime: number
  plan_id: string
}

export interface UsageCreateProps {
  amountTime: number
  createdAt: Date
  plan_id: string
}