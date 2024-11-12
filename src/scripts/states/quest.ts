/* eslint-disable @typescript-eslint/no-empty-function */
import StateMachine from './stateMachine'
import { Quest } from '../../types/tasks'
import QuestStep from './questStep'
//const dt = math.randomseed(os.time())

export default class QuestState {
  //private _questmethods: WorldQuestsMethods
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
    this.fsm.addState('active', {
      onEnter: this.onActiveEnter.bind(this),
      onUpdate: this.onActiveUpdate.bind(this),
      onExit: this.onActiveExit.bind(this),
    })
    this.fsm.addState('new', {
      onEnter: this.onNewEnter.bind(this),
      onUpdate: this.onNewUpdate.bind(this),
      onExit: this.onNewExit.bind(this),
    })
  }
  private onNewEnter(): void {
    let kc: keyof typeof this.conditions
    for (kc in this.conditions) {
      this.conditions[kc].fsm.setState('idle')
    }
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
}
