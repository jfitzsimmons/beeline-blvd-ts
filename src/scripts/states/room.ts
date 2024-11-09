/* eslint-disable @typescript-eslint/no-empty-function */
import { Actors, Vacancies } from '../../types/state'
import { RoomProps } from '../../types/world'
import { RoomsInitState } from './inits/roomsInitState'
import StateMachine from './stateMachine'

export default class RoomState {
  fsm: StateMachine
  matrix: { x: number; y: number }
  roomName: string
  clearance: number
  stations: { [key: string]: string }
  actors: Actors
  props?: string[]
  vacancies?: Vacancies
  parent: RoomProps
  constructor(r: string, roomProps: RoomProps) {
    this.fsm = new StateMachine(this, 'room' + r)
    this.matrix = RoomsInitState[r].matrix
    this.roomName = RoomsInitState[r].roomName
    this.clearance = RoomsInitState[r].clearance
    this.stations = RoomsInitState[r].stations
    this.actors = RoomsInitState[r].actors
    this.props = RoomsInitState[r].props || []
    this.vacancies = RoomsInitState[r].vacancies || {}
    this.parent = roomProps
    this.fsm
      .addState('idle')
      .addState('focus', {
        onEnter: this.onFocusStart.bind(this),
        onUpdate: this.onFocusUpdate.bind(this),
        onExit: this.onFocusEnd.bind(this),
      })
      .addState('blur', {
        onEnter: this.onBlurEnter.bind(this),
        onUpdate: this.onBlurUpdate.bind(this),
        onExit: this.onBlurExit.bind(this),
      })
  }
  private onFocusStart(): void {
    //highlight room neighbors and directions
    //do something with stations, clear them
    //testjpf getPlayerRoom method
    this.parent.setFocused(this.roomName)
  }
  private onFocusUpdate(): void {
    //not bad to handle interactions
  }
  private onFocusEnd(): void {}
  private onBlurEnter(): void {}
  private onBlurUpdate(): void {
    this.fsm.setState('idle')
  }
  private onBlurExit(): void {}
}
