/* eslint-disable @typescript-eslint/no-empty-function */

import StateMachine from './stateMachine'
import { Inventories, Room } from '../../types/state'
//import { RoomProps } from '../../types/world'
//import { aiActions } from '../ai/ai_main'

export default class RoomState {
  fsm: StateMachine
  matrix: { x: number; y: number }
  name: string
  clearance: number
  actors: Inventories
  props?: string[]
  stationKeys: string[]
  wardKeys: string[] = []
  focus: boolean
  onScreen: boolean
  moments: string[]
  // p: RoomProps
  //checks: RoomChecks
  //outcomes: RoomOutcomes
  constructor(r: Room) {
    this.fsm = new StateMachine(this, 'room' + r)
    this.matrix = r.matrix
    this.name = r.name
    this.clearance = r.clearance
    this.actors = r.actors
    this.props = r.props || []
    this.stationKeys = []
    this.moments = r.moments
    ;(this.focus = false), (this.onScreen = false)
    // this.p = roomProps
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
    // this.p.setFocused(this.name)
  }
  private onFocusUpdate(): void {
    // this.name as keyof typeof aiActions
    /*
   if (this.name in aiActions) {
      print('##### FOCUSEDRoom::::: >>', this.name, 'AIACTIONS:: Running...')
      aiActions[this.name as keyof typeof aiActions].bind(this)()
      print('#### FOCUSEDRoom:::: >>', this.name, 'AIACTIONS:: Finished.')
    }
      */
    this.fsm.setState('turn')
  }
  private onFocusEnd(): void {}
  /**
  private onBlurEnter(): void {}
  private onBlurUpdate(): void {
    this.name as keyof typeof aiActions
    if (this.name in aiActions)
      aiActions[this.name as keyof typeof aiActions].bind(this)()
    this.fsm.setState('turn')
  }
  private onBlurExit(): void {}
  **/
  private onTurnEnter(): void {}
  private onTurnUpdate(): void {
    /*
    this.name as keyof typeof aiActions
    if (this.name in aiActions) {
      print('##### Room::::: >>', this.name, 'AIACTIONS:: Running...')
      aiActions[this.name as keyof typeof aiActions].bind(this)()
      print('#### Room:::: >>', this.name, 'AIACTIONS:: Finished.')
    }
      */
  }
  private onTurnExit(): void {}
}
