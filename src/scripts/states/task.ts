/* eslint-disable @typescript-eslint/no-empty-function */
import { Task, TaskMethods } from '../../types/tasks'
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
  parent: TaskMethods

  constructor(t: Task, taskMethods: TaskMethods) {
    this.fsm = new StateMachine(this, 'tasks')
    this.label = t.label
    this.owner = t.owner
    this.target = t.target
    this.turns = t.turns
    this.scope = t.scope
    this.authority = t.authority
    this.cause = t.cause
    this.parent = taskMethods
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
    this.fsm.addState('confront', {
      onEnter: this.onConfrontEnter.bind(this),
      onUpdate: this.onConfrontUpdate.bind(this),
      onExit: this.onConfrontExit.bind(this),
    })
    this.fsm.addState('injury', {
      onEnter: this.onInjuryEnter.bind(this),
      onUpdate: this.onInjuryUpdate.bind(this),
      onExit: this.onInjuryExit.bind(this),
    })
    this.fsm.addState('converse', {
      onEnter: this.onConverseEnter.bind(this),
      onUpdate: this.onConverseUpdate.bind(this),
      onExit: this.onConverseExit.bind(this),
    })
    this.fsm.addState('medical', {
      onEnter: this.onMedicalEnter.bind(this),
      onUpdate: this.onMedicalUpdate.bind(this),
      onExit: this.onMedicalExit.bind(this),
    })
    this.fsm.addState('clearance', {
      onEnter: this.onClearEnter.bind(this),
      onUpdate: this.onClearUpdate.bind(this),
      onExit: this.onClearExit.bind(this),
    })

    this.fsm.setState(setInitFSMstate(t))
  }
  private onNewEnter(): void {}
  private onNewUpdate(): void {}
  private onNewExit(): void {}
  private onInjuryEnter(): void {
    //TESTJPF BLOCKER Task cannot see if doctor and patient are in the same room
    //give roomstate a same room method?
    this.parent.addAdjustMendingQueue(this.target)
    this.turns = 0
  }
  private onInjuryUpdate(): void {}
  private onInjuryExit(): void {}
  private onConfrontEnter(): void {}
  private onConfrontUpdate(): void {}
  private onConfrontExit(): void {}
  private onConverseEnter(): void {}
  private onConverseUpdate(): void {}
  private onConverseExit(): void {}
  private onMedicalEnter(): void {}
  private onMedicalUpdate(): void {}
  private onMedicalExit(): void {}
  private onClearEnter(): void {}
  private onClearUpdate(): void {}
  private onClearExit(): void {}
  private onTurnEnter(): void {}
  private onTurnUpdate(): void {}
  private onTurnExit(): void {}
}
// testjpf maybe:::
function setInitFSMstate(t: Task): string {
  let state = 'idle'

  if (t.label == 'injury') {
    state = 'injury'
  } //else if (t.label == 'mender') {
  //  state = 'medical'
  //} else if (t.label == 'clearance') state = 'clearance'

  return state
}
