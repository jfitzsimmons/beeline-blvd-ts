/* eslint-disable @typescript-eslint/no-empty-function */
import { Task, TaskProps } from '../../types/tasks'
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
  parent: TaskProps

  constructor(t: Task, taskProps: TaskProps) {
    this.fsm = new StateMachine(
      this,
      `task-${t.owner}-${t.label}-${tostring(os.time())}`
    )
    this.label = t.label
    this.owner = t.owner
    this.target = t.target
    this.turns = t.turns
    this.scope = t.scope
    this.authority = t.authority
    this.cause = t.cause
    this.parent = taskProps
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
    this.fsm.addState('snitch', {
      onEnter: this.onSnitchEnter.bind(this),
      onUpdate: this.onSnitchUpdate.bind(this),
      onExit: this.onSnitchExit.bind(this),
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
  }
  private onInjuryUpdate(): void {
    print('injurytaskupdate::')
    for (const doc of ['doc01', 'doc02', 'doc03']) {
      if (this.parent.didCrossPaths(this.owner, doc)) {
        print(this.owner, 'met doc for injury task::', doc)
        this.parent.addAdjustMendingQueue(this.target)
        this.turns = 0
        break
      }
    }
  }
  private onInjuryExit(): void {}
  //testjpf. need snitch state.
  // when update check if cross security path
  // if true do already hunting dont create new task
  //update number of turns for old task
  //else create task for questioning or arrest
  // based on player / npc checks
  // player alert level is biffed
  //need npcs adjustAttributes(npc, attribute, property, new value)

  private onSnitchEnter(): void {}
  private onSnitchUpdate(): void {
    /** 
    for (const cop of [
      'security001',
      'security002',
      'security003',
      'security004',
      'security005',
    ]) {
      if (this.parent.didCrossPaths(this.owner, cop)) {
        print(this.owner, 'met cop for snitch task::', cop)
        const bulletin = this.parent.alreadyHunting(this.owner, this.target)
      }
    }

    this.parent.didCrossPaths(this.owner, this.target)
    */
  }
  private onSnitchExit(): void {}
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
  } else if (t.label == 'mender') {
    state = 'medical'
  } else if (t.label == 'clearance') state = 'clearance'
  else if (t.label == 'snitch') state = 'snitch'
  return state
}
