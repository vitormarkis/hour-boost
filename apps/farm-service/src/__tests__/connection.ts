import { EventEmitter } from "~/application/services";

export type DevConnectionEvents = {
  break: []
}

export class DevConnection extends EventEmitter<DevConnectionEvents> {

}

export const connection = new DevConnection()