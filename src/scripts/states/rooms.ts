import {
  RoomsInitState,
  RoomsInitLayout,
  RoomsInitRoles,
  RoomsInitFallbacks,
} from './inits/roomsInitState'
import { Rooms, Roles, Fallbacks } from '../../types/state'
import RoomState from './room'
import StateMachine from './stateMachine'
import { RoomMethod2 } from '../../types/tasks'

// todo TESTJPF needs room call like npcstate
// the have a avtive, player, neighbor state? something that automatically makes direction for npcs to target. up down left right...
// need rooms interface?
export default class WorldRooms {
  fsm: StateMachine

  private _all: Rooms
  layout: Array<Array<string | null>>
  roles: Roles
  private _focused: string
  roomsLists: RoomMethod2
  fallbacks: Fallbacks
  stationsMap: { [key: string]: { [key: string]: string } }
  constructor() {
    this.fsm = new StateMachine(this, 'rooms')
    this.fallbacks = { ...RoomsInitFallbacks }
    this.layout = [...RoomsInitLayout]
    this.roles = { ...RoomsInitRoles }
    this.roomsLists = {
      set_focused: this.set_focused.bind(this),
      // get_player_room: playerMethods.get_player_room.bind(this),
    }
    this._all = { ...seedRooms(this.roomsLists) }
    this._focused = 'grounds'
    this.stationsMap = this.createStationsMap()
    this.fsm.addState('idle').addState('turn', {
      onEnter: this.onTurnEnter.bind(this),
      onUpdate: this.onTurnUpdate.bind(this),
      onExit: this.onTurnExit.bind(this),
    })

    this.fsm.addState('transition', {
      onEnter: this.onTransitionEnter.bind(this),
      onUpdate: this.onTransitionUpdate.bind(this),
      onExit: this.onTransitionExit.bind(this),
    })

    this.clear_station = this.clear_station.bind(this)
    this.set_station = this.set_station.bind(this)

    this.prune_station_map = this.prune_station_map.bind(this)
    this.get_station_map = this.get_station_map.bind(this)
    this.reset_station_map = this.reset_station_map.bind(this)
    this.send_to_infirmary = this.send_to_infirmary.bind(this)
    this.set_focused = this.set_focused.bind(this)
    this.get_focused = this.get_focused.bind(this)
  }
  public get all(): Rooms {
    return this._all
  }
  public get focused(): string {
    return this._focused
  }
  public set focused(f: string) {
    this._focused = f
  }
  set_focused(r: string) {
    this.focused = r
  }
  get_focused(): string {
    return this.focused
  }
  send_to_infirmary(npc: string): string | null {
    const occs = this.all.infirmary.occupants!
    let ko: keyof typeof occs
    for (ko in occs) {
      if (occs[ko] == '') {
        occs[ko] = npc
        return ko
      }
    }
    return null
  }
  send_to_jail() {
    // testjpf todo this.all[this.roomsLists.get_player_room()].fsm.setState('idle')
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
    } else if (
      this.all[room].occupants !== undefined &&
      npc == this.all[room].occupants![station]
    ) {
      this.all[room].occupants![station] = ''
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

  private onTurnEnter(): void {
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
  private onTurnExit(): void {
    //todo
  }
  private onTransitionEnter(): void {
    //todo
  }
  private onTransitionUpdate(): void {
    //not bad to handle interactions
  }
  private onTransitionExit(): void {
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

function seedRooms(lists: RoomMethod2) {
  const seeded: Rooms = {}
  //const inits = { ...NpcsInitState }
  let ki: keyof typeof RoomsInitState
  for (ki in RoomsInitState) {
    // creat npc class constructor todo now testjpf
    // seeded.push({ [ki]: new NpcState(ki) })
    seeded[ki] = new RoomState(ki, lists)
  }
  return seeded
}
