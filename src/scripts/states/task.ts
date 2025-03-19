/* eslint-disable @typescript-eslint/no-empty-function */
import NpcState from './npc'
import WorldPlayer from './player'
import StateMachine from './stateMachine'
import { Task } from '../../types/tasks'
import { TaskProps } from '../../types/world'

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
  //checks: Partial<TasksChecks> | TasksChecks

  constructor(t: Task, taskProps: TaskProps) {
    this.label = t.label
    this.owner = t.owner
    this.target = t.target
    this.turns = t.turns
    this.scope = t.scope
    this.authority = t.authority
    this.cause = t.cause
    this.parent = taskProps
    // this.checks = this.setTaskChecks(this.label)
    this.fsm = new StateMachine(
      this,
      `task-${t.owner}-${t.label}-${tostring(os.time())}`
    )
    this.fsm.addState('idle')
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
    this.fsm.setState(setInitFSMstate(t))

    this.handleConfrontation = this.handleConfrontation.bind(this)
  }
  private onInjuryEnter(): void {}
  private onInjuryUpdate(): void {}
  private onInjuryExit(): void {}
  private onConfrontEnter(): void {
    this.handleConfrontation()
  }
  private onConfrontUpdate(): void {
    this.handleConfrontation()
  }
  private onConfrontExit(): void {}

  handleConfrontation() {
    const target: NpcState | WorldPlayer =
      this.target === 'player'
        ? this.parent.returnPlayer()
        : this.parent.returnNpc(this.target)
    if (
      this.parent.npcHasTask(
        [this.target],
        [],
        ['mender', 'injury', 'infirm']
      ) !== null
    )
      return

    const owner = this.parent.returnNpc(this.owner)
    if (
      owner.currRoom == target.currRoom ||
      (owner.currRoom == target.exitRoom && owner.exitRoom == target.currRoom)
    ) {
      this.target === 'player'
        ? this.playerConfrontConsequence(target.fsm, owner.fsm)
        : this.npc_confront_consequence()
      this.turns = 0
    }
  }
  playerConfrontConsequence(playerfsm: StateMachine, npcfsm: StateMachine) {
    playerfsm.setState('confronted')
    npcfsm.setState('confront')
    // this.parent.setConfrontation(this)
  }
  npc_confront_consequence() {
    if (this.label == 'arrest') {
      this.parent.returnNpc(this.target).fsm.setState('arrestee')
      return
    }
  }
}

function setInitFSMstate(t: Task): string {
  let state = 'idle'
  if (['questioning', 'arrest', 'confront'].includes(t.label))
    state = 'confront'
  else if (t.label == 'injury') state = 'injury'
  else if (t.label == 'mender') state = 'medical'
  else if (t.label == 'snitch') state = 'snitch'
  else if (t.label == 'reckless') state = 'reckless'
  return state
}
