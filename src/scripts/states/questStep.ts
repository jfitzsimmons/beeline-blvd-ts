/* eslint-disable @typescript-eslint/no-empty-function */
import StateMachine from './stateMachine'
import { QuestCondition } from '../../types/tasks'
//const dt = math.randomseed(os.time())

export default class QuestStep {
  //private _questmethods: AllQuestsMethods
  label: string
  solution?: string
  passed: boolean
  //status: 'inactive' | 'active' | 'complete' | 'standby' | 'failed'
  interval: string[]
  func: { (args: [() => any, any]): boolean }[]
  args: [() => any, any][]
  fsm: StateMachine
  constructor(step: QuestCondition) {
    this.fsm = new StateMachine(this, 'quest')
    this.label = step.label
    this.passed = step.passed
    this.interval = step.interval
    this.func = step.func
    this.args = step.args
    //this._spawn = 'grounds'
    //this.mendingQueue = []
    this.fsm.addState('idle')
    this.fsm.addState('turn', {
      onEnter: this.onTurnEnter.bind(this),
      onUpdate: this.onTurnUpdate.bind(this),
      onExit: this.onTurnExit.bind(this),
    })
    this.fsm.addState('inactive', {
      onEnter: this.onInactiveEnter.bind(this),
      onUpdate: this.onInactiveUpdate.bind(this),
      onExit: this.onInactiveExit.bind(this),
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
  private onTurnUpdate(): void {
    //testjpf
  }
  private onTurnExit(): void {}
  private onInactiveEnter(): void {}
  private onInactiveUpdate(): void {}
  private onInactiveExit(): void {}
}
