import { Usage } from "../entity"

export interface UsagesRepository {
  save(usage: Usage): Promise<string>
}
