/* eslint-disable @typescript-eslint/no-empty-function */
import StateMachine from './stateMachine'
import { Quest } from '../../types/tasks'
import QuestStep from './questStep'
//const dt = math.randomseed(os.time())

export default class QuestState {
  //private _questmethods: AllQuestsMethods
  id: string
  passed: boolean
  fsm: StateMachine
  conditions: { [key: string]: QuestStep }
  constructor(questparams: Quest) {
    this.id = questparams.id
    this.fsm = new StateMachine(this, 'quest' + this.id)
    this.passed = questparams.passed
    this.conditions = questparams.conditions
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
