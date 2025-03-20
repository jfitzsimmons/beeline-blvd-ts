/* eslint-disable @typescript-eslint/no-empty-function */
import { RoomsInitState } from './inits/roomsInitState'
import StateMachine from './stateMachine'
import { Actors, Swaps, Wards } from '../../types/state'
import { RoomProps } from '../../types/world'
import { aiActions } from '../ai/ai_main'

export default class RoomState {
  fsm: StateMachine
  matrix: { x: number; y: number }
  roomName: string
  clearance: number
  stations: { [key: string]: string }
  swaps: Swaps
  actors: Actors
  props?: string[]
  wards?: Wards
  p: RoomProps
  //checks: RoomChecks
  //outcomes: RoomOutcomes
  constructor(r: string, roomProps: RoomProps) {
    this.fsm = new StateMachine(this, 'room' + r)
    this.matrix = RoomsInitState[r].matrix
    this.roomName = RoomsInitState[r].roomName
    this.clearance = RoomsInitState[r].clearance
    this.stations = RoomsInitState[r].stations
    this.swaps = RoomsInitState[r].swaps
    this.actors = RoomsInitState[r].actors
    this.props = RoomsInitState[r].props || []
    this.wards = RoomsInitState[r].wards || {}
    this.p = roomProps
    this.fsm
      .addState('idle')
      .addState('turn', {
        onEnter: this.onTurnEnter.bind(this),
        onUpdate: this.onTurnUpdate.bind(this),
        onExit: this.onTurnExit.bind(this),
      })
      .addState('focus', {
        onEnter: this.onFocusStart.bind(this),
        onUpdate: this.onFocusUpdate.bind(this),
        onExit: this.onFocusEnd.bind(this),
      })
    this.fsm.setState('turn')
  }
  private onFocusStart(): void {
    //highlight room neighbors and directions
    //testjpf
    this.p.setFocused(this.roomName)
  }
  private onFocusUpdate(): void {
    this.roomName as keyof typeof aiActions
    if (this.roomName in aiActions) {
      print(
        '##### FOCUSEDRoom::::: >>',
        this.roomName,
        'AIACTIONS:: Running...'
      )
      aiActions[this.roomName as keyof typeof aiActions].bind(this)()
      print('#### FOCUSEDRoom:::: >>', this.roomName, 'AIACTIONS:: Finished.')
    }
    this.fsm.setState('turn')
  }
  private onFocusEnd(): void {}
  /**
  private onBlurEnter(): void {}
  private onBlurUpdate(): void {
    this.roomName as keyof typeof aiActions
    if (this.roomName in aiActions)
      aiActions[this.roomName as keyof typeof aiActions].bind(this)()
    this.fsm.setState('turn')
  }
  private onBlurExit(): void {}
  **/
  private onTurnEnter(): void {}
  private onTurnUpdate(): void {
    this.roomName as keyof typeof aiActions
    if (this.roomName in aiActions) {
      print('##### Room::::: >>', this.roomName, 'AIACTIONS:: Running...')
      aiActions[this.roomName as keyof typeof aiActions].bind(this)()
      print('#### Room:::: >>', this.roomName, 'AIACTIONS:: Finished.')
    }
  }
  private onTurnExit(): void {}
}
