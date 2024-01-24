import { EventEmitter } from "../application/services/event-emitter"

export type DevConnectionEvents = {
  break: [options?: { relog?: boolean; replaceRefreshToken?: boolean }]
}

export class DevConnection extends EventEmitter<DevConnectionEvents> {}

export const connection = new DevConnection()
