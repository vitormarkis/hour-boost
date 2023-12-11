import { EventEmitter } from "../application/services/event-emitter"

export type DevConnectionEvents = {
  break: []
}

export class DevConnection extends EventEmitter<DevConnectionEvents> {}

export const connection = new DevConnection()
