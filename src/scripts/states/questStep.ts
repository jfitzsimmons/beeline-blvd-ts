/* eslint-disable @typescript-eslint/no-empty-function */
import StateMachine from './stateMachine'
import { QuestProps } from '../../types/tasks'

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
  constructor(step: QuestProps) {
    this.label = step.label
    this.passed = step.passed
    this.interval = step.interval
    this.func = step.func
    this.args = step.args
    //this._spawn = 'grounds'
    //this.mendingQueue = []
    this.fsm = new StateMachine(this, 'step' + step.id)
    this.fsm.addState('idle')
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
  private onNewUpdate(): void {
    if (this.passed == true) return
    for (let i = this.func.length; i-- !== 0; ) {
      if (this.func[i](this.args[i]) == true) {
        this.passed = true
        print('queststeppass???:::', this.passed)
      }

      print(this.label, 'newupdaeteQUESTQUESTQUEST')
    }
  }
  private onNewExit(): void {}
  private onActiveEnter(): void {
    if (this.passed == true) return
    for (let i = this.func.length; i-- !== 0; ) {
      if (this.func[i](this.args[i]) == true) {
        this.passed = true
        print('queststeppass???:::', this.passed)
      }

      print(this.label, 'ACTIVE ENTERQUESTQUESTQUEST')
    }
  }
  private onActiveUpdate(): void {
    if (this.passed == true) return
    for (let i = this.func.length; i-- !== 0; ) {
      if (this.func[i](this.args[i]) == true) {
        this.passed = true
        print('queststeppass???:::', this.passed)
      }

      print(this.label, 'ACTIVEUP!!! QUESTQUESTQUEST')
    }
  }
  private onActiveExit(): void {}
  private onCompleteEnter(): void {}
  private onCompleteUpdate(): void {}
  private onCompleteExit(): void {}
}
