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
  constructor() {
    this._all = seedRooms()
    this.fsm = new StateMachine(this, 'rooms')

    //this._all = { ...RoomsInitState }
    this.layout = [...RoomsInitLayout]
    this.roles = { ...RoomsInitRoles }
    this.fallbacks = { ...RoomsInitFallbacks }
    this.fsm.addState('idle').addState('turn', {
      onEnter: this.onTurnStart.bind(this),
      onUpdate: this.onTurnUpdate.bind(this),
      onExit: this.onTurnEnd.bind(this),
    })

    this.fsm.setState('idle')
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
  private onTurnStart(): void {
    this.clear_stations()
  }
  private onTurnUpdate(): void {
    //not bad to handle interactions
  }
  private onTurnEnd(): void {
    //todo
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
