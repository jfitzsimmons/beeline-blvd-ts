import {
  RoomsInitState,
  RoomsInitLayout,
  RoomsInitRoles,
  RoomsInitFallbacks,
} from './inits/roomsInitState'
import { Rooms, Roles, Fallbacks } from '../../types/state'

// need rooms interface?
export default class WorldRooms {
  all: Rooms
  layout: Array<Array<string | null>>
  roles: Roles
  fallbacks: Fallbacks
  constructor() {
    this.all = { ...RoomsInitState }
    this.layout = [...RoomsInitLayout]
    this.roles = { ...RoomsInitRoles }
    this.fallbacks = { ...RoomsInitFallbacks }
  }

  // TODO - testjpf
  //abstract and import room types
  // create efficient look for clear station in TS
  clear_stations() {
    let kr: keyof typeof this.all // Type is "one" | "two" | "three"
    for (kr in this.all) {
      const room = this.all[kr]
      let sr: keyof typeof room.stations // Type is "one" | "two" | "three"
      for (sr in room.stations) {
        room.stations[sr] = ''
      }
    }
    let kfs: keyof typeof this.fallbacks.stations // Type is "one" | "two" | "three"
    for (kfs in this.fallbacks.stations) {
      this.fallbacks.stations[kfs] = ''
    }
  }
}
