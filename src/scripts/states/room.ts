/* eslint-disable @typescript-eslint/no-empty-function */
import { Actors, Occupants } from '../../types/state'
import { RoomsInitState } from './inits/roomsInitState'
import StateMachine from './stateMachine'

export default class RoomState {
  fsm: StateMachine
  matrix: { x: number; y: number }
  roomname: string
  clearance: number
  stations: { [key: string]: string }
  actors: Actors
  props?: string[]
  occupants?: Occupants
  constructor(r: string) {
    this.fsm = new StateMachine(this, 'room' + r)
    this.matrix = RoomsInitState[r].matrix
    this.roomname = RoomsInitState[r].roomname
    this.clearance = RoomsInitState[r].clearance
    this.stations = RoomsInitState[r].stations
    this.actors = RoomsInitState[r].actors
    this.props = RoomsInitState[r].props || []
    this.occupants = RoomsInitState[r].occupants || {}
    this.fsm
      .addState('idle')
      .addState('focus', {
        onEnter: this.onFocusStart.bind(this),
        onUpdate: this.onFocusUpdate.bind(this),
        onExit: this.onFocusEnd.bind(this),
      })
      .addState('arrest', {
        onEnter: this.onArrestEnter.bind(this),
        onUpdate: this.onArrestUpdate.bind(this),
        onExit: this.onArrestExit.bind(this),
      })
  }
  private onFocusStart(): void {
    //highlight room neighbors and directions
    //do something with stations, clear them
  }
  private onFocusUpdate(): void {
    //not bad to handle interactions
  }
  private onFocusEnd(): void {}
  private onArrestEnter(): void {}
  private onArrestUpdate(): void {}
  private onArrestExit(): void {}
}
