/* eslint-disable @typescript-eslint/no-empty-function */
import { Task } from '../../types/tasks'
import StateMachine from './stateMachine'
//import { AllQuestsMethods, WorldQuests, Task } from '../../types/tasks'
//mport { tutorialQuests } from './inits/quests/tutorialstate'
export default class TaskState {
  fsm: StateMachine
  label: string // merits
  owner: string
  target: string
  turns: number
  scope: string
  authority: string //ex; labor
  cause: string

  constructor(t: Task) {
    this.fsm = new StateMachine(this, 'tasks')
    this.label = t.label
    this.owner = t.owner
    this.target = t.target
    this.turns = t.turns
    this.scope = t.scope
    this.authority = t.authority
    this.cause = t.cause
    this.fsm.addState('idle')
    this.fsm.addState('turn', {
      onEnter: this.onTurnEnter.bind(this),
      onUpdate: this.onTurnUpdate.bind(this),
      onExit: this.onTurnExit.bind(this),
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
}
