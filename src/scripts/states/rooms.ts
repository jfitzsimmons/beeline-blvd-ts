import {
  RoomsInitState,
  RoomsInitLayout,
  RoomsInitRoles,
  RoomsInitFallbacks,
} from './inits/roomsInitState'
import { Rooms, Roles, Fallbacks } from '../../types/state'
import RoomState from './room'
import StateMachine from './stateMachine'

// todo TESTJPF needs room call like npcstate
// the have a avtive, player, neighbor state? something that automatically makes direction for npcs to target. up down left right...
// need rooms interface?
export default class WorldRooms {
  fsm: StateMachine

  private _all: Rooms
  layout: Array<Array<string | null>>
  roles: Roles
  fallbacks: Fallbacks
  stationsMap: { [key: string]: { [key: string]: string } }
  constructor() {
    this._all = { ...seedRooms() }
    this.fsm = new StateMachine(this, 'rooms')
    this.fallbacks = { ...RoomsInitFallbacks }
    this.stationsMap = this.createStationsMap()
    //this._all = { ...RoomsInitState }
    this.layout = [...RoomsInitLayout]
    this.roles = { ...RoomsInitRoles }
    this.fsm.addState('idle').addState('turn', {
      onEnter: this.onTurnStart.bind(this),
      onUpdate: this.onTurnUpdate.bind(this),
      onExit: this.onTurnEnd.bind(this),
    })

    this.fsm.addState('transition', {
      onEnter: this.onTransitionStart.bind(this),
      onUpdate: this.onTransitionUpdate.bind(this),
      onExit: this.onTransitionEnd.bind(this),
    })

    this.clear_station = this.clear_station.bind(this)
    this.set_station = this.set_station.bind(this)

    this.prune_station_map = this.prune_station_map.bind(this)
    this.get_station_map = this.get_station_map.bind(this)
    this.reset_station_map = this.reset_station_map.bind(this)
  }
  public get all(): Rooms {
    return this._all
  }
  prune_station_map(room: string, station: string) {
    this.stationsMap[room][station] !== null
      ? delete this.stationsMap[room][station]
      : delete this.stationsMap.fallbacks[station]
  }
  get_station_map(): { [key: string]: { [key: string]: string } } {
    return this.stationsMap
  }
  reset_station_map() {
    this.stationsMap = { ...this.createStationsMap() }
  }
  set_station(room: string, station: string, npc: string) {
    this.all[room].stations[station] !== null
      ? (this.all[room].stations[station] = npc)
      : (this.fallbacks.stations[station] = npc)
  }
  clear_station(room: string, station: string, npc: string) {
    if (npc == this.all[room].stations[station]) {
      this.all[room].stations[station] = ''
    } else if (npc == this.fallbacks.stations[station]) {
      this.fallbacks.stations[station] = ''
    }
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
  private onTurnStart(): void {
    //todo
  }
  private onTurnUpdate(): void {
    //give each npc the ability to delete their own station!!
    // this.clear_stations()
    //this is what whould go througheach room and click update
    //makes sense for npcs, but rooms??? testjpf
    //with placing npcs you have to take into account each npcs priority
    //not sure what else i could automate/optimize here:::
    //FUTURE gnerate money, food, stealing?
  }
  private onTurnEnd(): void {
    //todo
  }
  private onTransitionStart(): void {
    //todo
  }
  private onTransitionUpdate(): void {
    //not bad to handle interactions
  }
  private onTransitionEnd(): void {
    //todo
  }
  createStationsMap() {
    const stationMap: { [key: string]: { [key: string]: string } } = {}
    let ki: keyof typeof RoomsInitState
    for (ki in RoomsInitState) {
      // creat npc class constructor todo now testjpf
      // seeded.push({ [ki]: new NpcState(ki) })
      stationMap[ki] = { ...this.all[ki].stations }
    }
    stationMap['fallbacks'] = { ...this.fallbacks.stations }
    return stationMap
  }
}

function seedRooms() {
  const seeded: Rooms = {}
  //const inits = { ...NpcsInitState }
  let ki: keyof typeof RoomsInitState
  for (ki in RoomsInitState) {
    // creat npc class constructor todo now testjpf
    // seeded.push({ [ki]: new NpcState(ki) })
    seeded[ki] = new RoomState(ki)
  }
  return seeded
}
