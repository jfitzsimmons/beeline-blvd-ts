/* eslint-disable @typescript-eslint/no-empty-function */
import { Task, TaskProps } from '../../types/tasks'
//import { npcSnitchCheck } from '../systems/tasksystem'
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
    for (const cop of [
      'security001',
      'security002',
      'security003',
      'security004',
      'security005',
    ]) {
      if (!this.parent.didCrossPaths(this.owner, cop)) return
      print(this.owner, 'met cop for snitch task::', cop)
      //      const priors = this.parent.alreadyHunting(this.owner, this.target)
      const priors = this.parent.npcHasTask(this.owner, this.target, [
        'questioning',
        'arrest',
      ])
      const caution_state =
        this.target == 'player'
          ? this.playerSnitchCheck(priors !== null, cop)
          : this.npcSnitchCheck(cop)

      if (priors == null) {
        this.parent.taskBuilder(cop, caution_state, this.target, this.cause)
      } else {
        priors.turns = priors.turns + 6
      }
    }
    this.turns = 0
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

  playerSnitchCheck(priors: boolean, cop: string): string {
    ///testjpf still nrrd to figure out alert_level!!!
    //do alert_level search

    let caution_state = 'questioning'
    const player = this.parent.returnPlayer()
    if (player.alert_level > 3) caution_state = 'arrest'
    player.alert_level =
      priors == null ? player.alert_level + 1 : player.alert_level + 2
    if (
      player.alert_level > 5 &&
      this.parent.npcHasTask(cop, 'player') == null
    ) {
      this.parent.taskBuilder(cop, 'snitch', 'player', this.cause)
    }
    print('plauer snith chk :: alertlvl::', player.alert_level)
    return caution_state
  }
  npcSnitchCheck(c: string) {
    let caution_state = 'questioning'
    const cop = this.parent.returnNpc(c)
    const target = this.parent.returnNpc(this.target)
    if (this.parent.npcHasTask(c, this.target, ['questioning', 'arrest'])) {
      cop.opinion[target.clan] = cop.opinion[target.clan] - 1
      print('NPCSNITCHCHK')
      if (math.random() < 0.33) caution_state = 'arrest'
    }
    return caution_state
  }
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
