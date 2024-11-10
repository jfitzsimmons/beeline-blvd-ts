/* eslint-disable @typescript-eslint/no-empty-function */
import StateMachine from './stateMachine'
import { QuestCondition } from '../../types/tasks'
//const dt = math.randomseed(os.time())

export default class QuestStep {
  //private _questmethods: WorldQuestsMethods
  label: string
  solution?: string
  passed: boolean
  //status: 'Active' | 'active' | 'complete' | 'standby' | 'failed'
  interval: string[]
  func: { (args: [() => any, any]): boolean }[]
  args: [() => any, any][]
  fsm: StateMachine
  constructor(step: QuestCondition) {
    this.label = step.label
    this.passed = step.passed
    this.interval = step.interval
    this.func = step.func
    this.args = step.args
    //this._spawn = 'grounds'
    //this.mendingQueue = []
    this.fsm = new StateMachine(this, 'step' + step.id)
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
  private onNewEnter(): void {
    this.fsm.setState('idle')
  }
  private onNewUpdate(): void {}
  private onNewExit(): void {}
  private onTurnEnter(): void {}
  private onTurnUpdate(): void {
    //testjpf
  }
  private onTurnExit(): void {}
  private onActiveEnter(): void {}
  private onActiveUpdate(): void {}
  private onActiveExit(): void {}
  private onCompleteEnter(): void {}
  private onCompleteUpdate(): void {}
  private onCompleteExit(): void {}
}
