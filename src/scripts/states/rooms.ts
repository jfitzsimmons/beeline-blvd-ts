import {
  RoomsInitState,
  RoomsInitLayout,
  RoomsInitRoles,
  RoomsInitFallbacks,
} from './inits/roomsInitState'
import { Rooms, Roles, Fallbacks } from '../../types/state'

// need rooms interface?
export default class WorldRooms {
  private _all: Rooms
  layout: Array<Array<string | null>>
  roles: Roles
  fallbacks: Fallbacks
  constructor() {
    this._all = { ...RoomsInitState }
    this.layout = [...RoomsInitLayout]
    this.roles = { ...RoomsInitRoles }
    this.fallbacks = { ...RoomsInitFallbacks }
  }
  public get all(): Rooms {
    return this._all
  }

  clear_stations() {
    let kr: keyof typeof this._all
    for (kr in this._all) {
      const room = this._all[kr]
      let sr: keyof typeof room.stations
      for (sr in room.stations) {
        room.stations[sr] = ''
      }
    }
    let kfs: keyof typeof this.fallbacks.stations
    for (kfs in this.fallbacks.stations) {
      this.fallbacks.stations[kfs] = ''
    }
  }
}
