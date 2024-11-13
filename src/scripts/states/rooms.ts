/* eslint-disable @typescript-eslint/no-empty-function */
import {
  RoomsInitState,
  RoomsInitLayout,
  RoomsInitRoles,
  RoomsInitFallbacks,
} from './inits/roomsInitState'
import RoomState from './room'
import StateMachine from './stateMachine'
import { Rooms, Roles, Fallbacks } from '../../types/state'
import { RoomProps, WorldArgs } from '../../types/world'

const dt = math.randomseed(os.time())

export default class WorldRooms {
  fsm: StateMachine
  private _all: Rooms
  layout: Array<Array<string | null>>
  roles: Roles
  private _focused: string
  parent: RoomProps
  fallbacks: Fallbacks
  stationsMap: { [key: string]: { [key: string]: string } }
  constructor(roomsProps: WorldArgs) {
    this.fsm = new StateMachine(this, 'rooms')
    this.fallbacks = { ...RoomsInitFallbacks }
    this.layout = [...RoomsInitLayout]
    this.roles = { ...RoomsInitRoles }
    this.parent = {
      setFocused: this.setFocused.bind(this),
      ...roomsProps,
    }

    this._all = { ...seedRooms(this.parent) }
    this._focused = 'grounds'
    this.stationsMap = this.createStationsMap()
    this.fsm
      .addState('idle')
      .addState('turn', {
        onEnter: this.onTurnEnter.bind(this),
        onUpdate: this.onTurnUpdate.bind(this),
        onExit: this.onTurnExit.bind(this),
      })
      .addState('new', {
        onEnter: this.onNewEnter.bind(this),
        onUpdate: this.onNewUpdate.bind(this),
        onExit: this.onNewExit.bind(this),
      })
      .addState('transition', {
        onEnter: this.onTransitionEnter.bind(this),
        onUpdate: this.onTransitionUpdate.bind(this),
        onExit: this.onTransitionExit.bind(this),
      })

    this.clearStation = this.clearStation.bind(this)
    this.setStation = this.setStation.bind(this)
    this.isStationedTogether = this.isStationedTogether.bind(this)
    this.pruneStationMap = this.pruneStationMap.bind(this)
    this.getStationMap = this.getStationMap.bind(this)
    this.resetStationMap = this.resetStationMap.bind(this)
    this.sendToVacancy = this.sendToVacancy.bind(this)
    this.setFocused = this.setFocused.bind(this)
    this.get_focused = this.get_focused.bind(this)
    this.getOccupants = this.getOccupants.bind(this)
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
  getOccupants(r: string): string[] {
    return Object.values(this.all[r].stations).filter((s) => s != '')
  }
  setFocused(r: string) {
    this.focused = r
  }
  get_focused(): string {
    return this.focused
  }
  sendToVacancy(room: string, npc: string): string | null {
    const occs = this.all[room].vacancies!
    let ko: keyof typeof occs
    for (ko in occs) {
      if (occs[ko] == '') {
        occs[ko] = npc
        return ko
      }
    }
    return null
  }
  isStationedTogether(npcs: string[], room: string): boolean {
    const stations = this.all[room].stations
    let ks: keyof typeof stations
    for (ks in stations) {
      if (npcs.includes(stations[ks])) return true
    }
    return false
  }
  pruneStationMap(room: string, station: string) {
    this.stationsMap[room][station] !== null
      ? delete this.stationsMap[room][station]
      : delete this.stationsMap.fallbacks[station]
  }
  getStationMap(): { [key: string]: { [key: string]: string } } {
    return this.stationsMap
  }
  resetStationMap() {
    this.stationsMap = { ...this.createStationsMap() }
  }
  setStation(room: string, station: string, npc: string) {
    this.all[room].stations[station] !== null
      ? (this.all[room].stations[station] = npc)
      : (this.fallbacks.stations[station] = npc)
  }
  clearStation(room: string, station: string, npc: string) {
    if (npc == this.all[room].stations[station]) {
      this.all[room].stations[station] = ''
    } else if (npc == this.fallbacks.stations[station]) {
      this.fallbacks.stations[station] = ''
    } else if (
      this.all[room].vacancies !== undefined &&
      npc == this.all[room].vacancies![station]
    ) {
      this.all[room].vacancies![station] = ''
    }
  }
  private onTurnEnter(): void {}
  private onTurnUpdate(): void {
    this.resetStationMap()
    let kr: keyof typeof this.all
    for (kr in this.all) {
      // creat npc class constructor todo now testjpf
      // seeded.push({ [ki]: new NpcState(ki) })
      this.all[kr].fsm.update(dt)
    }
  }
  private onTurnExit(): void {
    //todo
  }
  private onNewEnter(): void {
    this.resetStationMap()
    let kr: keyof typeof this.all
    for (kr in this.all) {
      // creat npc class constructor todo now testjpf
      // seeded.push({ [ki]: new NpcState(ki) })
      this.all[kr].fsm.setState('turn')
    }
    this.fsm.setState('turn')
  }
  private onNewUpdate(): void {}
  private onNewExit(): void {
    //todo
  }
  private onTransitionEnter(): void {
    //todo
  }
  private onTransitionUpdate(): void {}
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

function seedRooms(lists: RoomProps) {
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
