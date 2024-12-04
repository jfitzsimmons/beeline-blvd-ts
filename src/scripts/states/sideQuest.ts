/* eslint-disable @typescript-eslint/no-empty-function */
import StateMachine from './stateMachine'
import { SideQuestProps } from '../../types/tasks'

//const dt = math.randomseed(os.time())

export default class SideQuest {
  //private _questmethods: WorldQuestsMethods
  label: string
  solution?: string
  passed: boolean
  //status: 'Active' | 'active' | 'complete' | 'standby' | 'failed'
  fsm: StateMachine
  constructor(sidequest: SideQuestProps) {
    this.label = sidequest.label
    this.passed = sidequest.passed
    //this._spawn = 'grounds'
    //this.mendingQueue = []
    this.fsm = new StateMachine(this, 'sidequest' + sidequest.id)
    this.fsm.addState('idle')
    this.fsm.addState('turn', {
      onEnter: this.onTurnEnter.bind(this),
      onUpdate: this.onTurnUpdate.bind(this),
      onExit: this.onTurnExit.bind(this),
    })
    this.fsm.addState('active', {
      onEnter: this.onActiveEnter.bind(this),
      onUpdate: this.onActiveUpdate.bind(this),
      onExit: this.onActiveExit.bind(this),
    })
    this.fsm.addState('complete', {
      onEnter: this.onCompleteEnter.bind(this),
      onUpdate: this.onCompleteUpdate.bind(this),
      onExit: this.onCompleteExit.bind(this),
    })
    this.fsm.addState('new', {
      onEnter: this.onNewEnter.bind(this),
      onUpdate: this.onNewUpdate.bind(this),
      onExit: this.onNewExit.bind(this),
    })
  }
  private onNewEnter(): void {}
  private onNewUpdate(): void {}
  private onNewExit(): void {}
  private onTurnEnter(): void {}
  private onTurnUpdate(): void {}
  private onTurnExit(): void {}
  private onActiveEnter(): void {}
  private onActiveUpdate(): void {}
  private onActiveExit(): void {}
  private onCompleteEnter(): void {}
  private onCompleteUpdate(): void {}
  private onCompleteExit(): void {}
}
