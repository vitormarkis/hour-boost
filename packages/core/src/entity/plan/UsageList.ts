import { ApplicationError } from "core/entity/exceptions"
import { makeID } from "core/entity/generateID"
import { Usage } from "core/entity/plan/Usage"

export class UsageList {
  readonly data: Usage[]
  readonly trash: Usage[]

  constructor(props: UsageListProps = {}) {
    this.data = props.data ?? []
    this.trash = props.trash ?? []
  }

  add(usage: Usage) {
    this.data.push(usage)
  }

  remove(usageID: string) {
    const usageIndex = this.data.findIndex(u => u.id_usage === usageID)
    if (usageIndex === -1) throw new ApplicationError("Falha ao remover usage. Usage não encontrado.", 404)
    this.trash.push(this.data[usageIndex])
    this.data.splice(usageIndex, 1)
  }

  getTrashIDs() {
    return this.trash.map(u => u.id_usage)
  }

  getIDs() {
    return this.data.map(u => u.id_usage)
  }
}

export interface UsageListProps {
  data?: Usage[]
  trash?: Usage[]
}

export interface UsageListCreateProps {}
