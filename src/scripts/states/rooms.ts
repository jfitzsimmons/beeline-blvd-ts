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
  stationsMap: {
    [key: string]: { [key: string]: { [key: string]: string } }
  }
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
    this.stationsMap = { ...this.createStationsMap() }
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
    this.pruneStationMap = this.pruneStationMap.bind(this)
    this.getStationMap = this.getStationMap.bind(this)
    this.checkSetStation = this.checkSetStation.bind(this)
    this.resetStationMap = this.resetStationMap.bind(this)
    this.sendToVacancy = this.sendToVacancy.bind(this)
    this.getWards = this.getWards.bind(this)
    this.setFocused = this.setFocused.bind(this)
    this.get_focused = this.get_focused.bind(this)
    this.getOccupants = this.getOccupants.bind(this)
    this.setSwapParent = this.setSwapParent.bind(this)
    this.pruneSwapParent = this.pruneSwapParent.bind(this)
    this.clearSwapParent = this.clearSwapParent.bind(this)
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
    return [...Object.values(this._all[r].stations).filter((s) => s != '')]
  }
  setFocused(r: string) {
    this.focused = r
  }
  get_focused(): string {
    return this.focused
  }
  sendToVacancy(
    room: string,
    npc: string,
    currRoom: string,
    currStation: string
  ): string | null {
    const occs = this._all[room].wards!
    let ko: keyof typeof occs
    for (ko in occs) {
      if (occs[ko] == '') {
        this.clearStation(currRoom, currStation, npc)
        occs[ko] = npc
        return ko
      }
    }
    return null
  }

  pruneSwapParent(r: string, s: string): boolean {
    const roomSwaps = this._all[r].swaps
    let ksw: keyof typeof roomSwaps
    for (ksw in roomSwaps) {
      if (roomSwaps[ksw][0] === s) {
        delete this.stationsMap[r].swaps[s]
        delete this.stationsMap[r].stations[ksw]
        return true
      }
    }
    return false
  }
  pruneStationMap(room: string, station: string) {
    this.stationsMap[room].stations[station] !== null
      ? delete this.stationsMap[room].stations[station]
      : this.pruneSwapParent(room, station) === false &&
        delete this.stationsMap.backup.fallbacks[station]
  }
  getStationMap(): {
    [key: string]: { [key: string]: { [key: string]: string } }
  } {
    return this.stationsMap
  }
  resetStationMap() {
    this.stationsMap = { ...this.createStationsMap() }
  }
  setSwapParent(r: string, s: string, npc: string): boolean {
    const roomSwaps = this._all[r].swaps
    let ksw: keyof typeof roomSwaps
    for (ksw in roomSwaps) {
      if (roomSwaps[ksw][0] == s) {
        this._all[r].swaps[ksw][1] = npc
        return true
      }
    }
    return false
  }
  checkSetStation(room: string, station: string, npc: string): boolean {
    const map = this.getStationMap()
    if (map[room][station] !== undefined) {
      this.setStation(room, station, npc)
      return true
    }
    return false
  }
  setStation(room: string, station: string, npc: string) {
    this._all[room].stations[station] !== null
      ? (this._all[room].stations[station] = npc)
      : this.setSwapParent(room, station, npc) === false &&
        (this.fallbacks.stations[station] = npc)

    this.pruneStationMap(room, station)
  }
  clearSwapParent(r: string, s: string, n: string): boolean {
    const roomSwaps = this._all[r].swaps
    let ksw: keyof typeof roomSwaps
    for (ksw in roomSwaps) {
      if (roomSwaps[ksw][0] == s && roomSwaps[ksw][1] == n) {
        this._all[r].swaps[ksw][1] = ''
        return true
      }
    }
    return false
  }
  clearStation(room: string, station: string, npc: string) {
    if (room === '') return
    if (npc == this._all[room].stations[station]) {
      this._all[room].stations[station] = ''
    } else if (this.clearSwapParent(room, station, npc) === true) {
      return
    } else if (npc == this.fallbacks.stations[station]) {
      this.fallbacks.stations[station] = ''
    } else if (
      this._all[room].wards !== undefined &&
      npc == this._all[room].wards?.[station]
    ) {
      this._all[room].wards![station] = ''
    }
  }

  private onTurnEnter(): void {
    this.resetStationMap()
  }
  private onTurnUpdate(): void {
    this.resetStationMap()
    let kr: keyof typeof this._all
    for (kr in this._all) this._all[kr].fsm.update(dt)
  }
  private onTurnExit(): void {}
  private onNewEnter(): void {}
  private onNewUpdate(): void {}
  private onNewExit(): void {}
  private onTransitionEnter(): void {}
  private onTransitionUpdate(): void {}
  private onTransitionExit(): void {}
  getWards(room: string): string[] {
    return Object.values(this._all[room].wards!).filter((s) => s !== '')
  }
  createStationsMap() {
    const stationMap: {
      [key: string]: { [key: string]: { [key: string]: string } }
    } = { backup: { fallbacks: {} } }
    let ki: keyof typeof RoomsInitState
    for (ki in RoomsInitState) {
      stationMap[ki] = {
        stations: { ...RoomsInitState[ki].stations },
        swaps: {},
      }
      const swaps = { ...RoomsInitState[ki].swaps }
      let si: keyof typeof swaps
      for (si in swaps) {
        stationMap[ki].swaps[swaps[si][0]] = swaps[si][1]
      }
    }

    stationMap['backup']['fallbacks'] = { ...RoomsInitFallbacks.stations }
    return stationMap
  }
}

function seedRooms(lists: RoomProps) {
  const seeded: Rooms = {}
  let ki: keyof typeof RoomsInitState
  for (ki in RoomsInitState) {
    seeded[ki] = new RoomState(ki, lists)
  }
  return seeded
}
