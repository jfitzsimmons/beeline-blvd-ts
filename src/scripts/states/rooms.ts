import { RoomsInitState } from './inits/roomsInitState'
import { RoomsState } from '../../types/state'

// need rooms interface?
export default class WorldRooms {
  private rooms: RoomsState
  constructor() {
    this.rooms = { ...RoomsInitState }
  }

  // TODO - testjpf
  //abstract and import room types
  // create efficient look for clear station in TS
  private clearStations() {
    let kr: keyof typeof this.rooms.all // Type is "one" | "two" | "three"
    for (kr in this.rooms.all) {
      const room = this.rooms.all[kr]
      let sr: keyof typeof room.stations // Type is "one" | "two" | "three"
      for (sr in room.stations) {
        room.stations[sr] = ''
      }
    }
    let kfs: keyof typeof this.rooms.fallbacks.stations // Type is "one" | "two" | "three"
    for (kfs in this.rooms.fallbacks.stations) {
      this.rooms.fallbacks.stations[kfs] = ''
    }
  }
}
