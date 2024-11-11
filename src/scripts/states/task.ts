/* eslint-disable @typescript-eslint/no-empty-function */
import { NpcsInitState } from './inits/npcsInitState'
import { PlayerInitState } from './inits/playerInitState'
import NpcState from './npc'
import WorldPlayer from './player'
import StateMachine from './stateMachine'
import { Consequence, Effect, Task, TasksChecks } from '../../types/tasks'
import { TaskProps } from '../../types/world'
import { fxLookup, fx } from '../utils/consts'
import { shuffle } from '../utils/utils'

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
  checks: Partial<TasksChecks> | TasksChecks

  constructor(t: Task, taskProps: TaskProps, allChecks: TasksChecks) {
    this.label = t.label
    this.owner = t.owner
    this.target = t.target
    this.turns = t.turns
    this.scope = t.scope
    this.authority = t.authority
    this.cause = t.cause
    this.parent = taskProps
    this.checks = this.setTaskChecks(this.label, allChecks)
    this.fsm = new StateMachine(
      this,
      `task-${t.owner}-${t.label}-${tostring(os.time())}`
    )
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
    this.fsm.addState('medical', {
      onEnter: this.onMedicalEnter.bind(this),
      onUpdate: this.onMedicalUpdate.bind(this),
      onExit: this.onMedicalExit.bind(this),
    })
    this.fsm.addState('merit', {
      onEnter: this.onMeritEnter.bind(this),
      onUpdate: this.onMeritUpdate.bind(this),
      onExit: this.onMeritExit.bind(this),
    })
    this.fsm.addState('hallpass', {
      onEnter: this.onHallpassEnter.bind(this),
      onUpdate: this.onHallpassUpdate.bind(this),
      onExit: this.onHallpassExit.bind(this),
    })
    this.fsm.addState('reckless', {
      onEnter: this.onRecklessEnter.bind(this),
      onUpdate: this.onRecklessUpdate.bind(this),
      onExit: this.onRecklessExit.bind(this),
    })
    this.fsm.setState(setInitFSMstate(t))

    this.handleConfrontation = this.handleConfrontation.bind(this)
  }
  private onNewEnter(): void {}
  private onNewUpdate(): void {}
  private onNewExit(): void {}
  private onInjuryEnter(): void {}
  private onInjuryUpdate(): void {
    for (const doc of ['doc01', 'doc02', 'doc03']) {
      const mobile = () =>
        this.parent.npcHasTask(doc, 'any', ['mender', 'injury', 'infirm']) ===
        null

      if (this.parent.didCrossPaths(this.owner, doc) && mobile() === true) {
        print(this.owner, 'met doc for injury task::', doc)
        this.parent.addAdjustMendingQueue(this.target)
        this.turns = 0
        break
      }
    }
  }
  private onInjuryExit(): void {}
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
      const priors = this.parent.npcHasTask(this.owner, this.target, [
        'questioning',
        'arrest',
      ])
      const caution_state =
        this.target == 'player'
          ? this.checks.playerSnitchCheck!(priors !== null, cop, this.cause)
          : this.checks.npcSnitchCheck!(cop, this.target)

      if (priors == null) {
        this.parent.taskBuilder(cop, caution_state, this.target, this.cause)
      } else {
        priors.turns = priors.turns + 6
      }
      this.turns = 0
    }
  }
  private onSnitchExit(): void {}
  private onHallpassEnter(): void {
    const holder =
      this.owner == 'player'
        ? this.parent.returnPlayer()
        : this.parent.returnNpc(this.owner)

    holder.clearance = tonumber(this.scope.charAt(this.scope.length - 1))!
  }
  private onHallpassUpdate(): void {
    if (this.turns < 1) {
      const holder =
        this.owner == 'player'
          ? this.parent.returnPlayer()
          : this.parent.returnNpc(this.owner)
      holder.clearance =
        this.owner === 'player'
          ? PlayerInitState.clearance
          : NpcsInitState[this.owner].clearance
    }
  }
  private onHallpassExit(): void {}
  private onConfrontEnter(): void {
    this.handleConfrontation()
  }
  private onConfrontUpdate(): void {
    this.handleConfrontation()
  }
  private onConfrontExit(): void {}
  private onMedicalEnter(): void {}
  private onMedicalUpdate(): void {}
  private onMedicalExit(): void {}
  private onMeritEnter(): void {}
  private onMeritUpdate(): void {
    const owner = this.parent.returnNpc(this.owner)
    const others = this.parent
      .getOccupants(owner.currRoom)
      .filter((o) => o !== this.owner)
    for (const npc of others) {
      const listener = this.parent.returnNpc(npc)
      if (this.target === 'player') {
        const adj = this.label === 'merits' ? 1 : -1
        listener.love = listener.love + adj
      }
      const fxArray: string[] =
        this.label === 'merits' ? fxLookup.merits : fxLookup.demerits
      const fx_labels = shuffle(fxArray)
      const effect: Effect = fx[fx_labels[0]]!
      if (effect.fx.type == 'opinion') {
        effect.fx.stat = NpcsInitState[this.target].clan
      }
      print(
        this.owner,
        'found:',
        npc,
        'because',
        this.label,
        '.',
        npc,
        'has effect:',
        fx_labels[1]
      )
      //check if they already have effect? testjpf
      listener.effects.push(effect)
      listener.add_effects_bonus(effect)
      break
    }
  }
  private onMeritExit(): void {}
  private onRecklessEnter(): void {}
  private onRecklessUpdate(): void {
    const owner = this.parent.returnNpc(this.owner)
    const others = this.parent
      .getOccupants(owner.currRoom)
      .filter(
        (o) =>
          o !== this.owner &&
          this.parent.npcHasTask(o, 'any', ['mender', 'injury', 'infirm']) ===
            null
      )
    const checks: Array<(target: string, listener: string) => Consequence> =
      this.cause == 'theft'
        ? shuffle([
            this.checks.ignorant_check!.bind(this),
            this.checks.dumb_crook_check!.bind(this),
            this.checks.chaotic_good_check!.bind(this),
          ])
        : shuffle([
            this.checks.classy_check!.bind(this),
            this.checks.predator_check!.bind(this),
          ])

    this.checks.build_consequence!(this, others[0], checks, false)
  }
  private onRecklessExit(): void {}
  private onTurnEnter(): void {}
  private onTurnUpdate(): void {}
  private onTurnExit(): void {}

  setTaskChecks(label: string, checks: TasksChecks): Partial<TasksChecks> {
    if (label == 'snitch') {
      return {
        playerSnitchCheck: checks.playerSnitchCheck.bind(this),
        npcSnitchCheck: checks.npcSnitchCheck.bind(this),
      }
    } else if (label == 'reckless') {
      return {
        build_consequence: checks.build_consequence.bind(this),
        ignorant_check: checks.ignorant_check.bind(this),
        dumb_crook_check: checks.dumb_crook_check.bind(this),
        chaotic_good_check: checks.chaotic_good_check.bind(this),
        classy_check: checks.classy_check.bind(this),
        predator_check: checks.predator_check.bind(this),
      }
    } else if (['questioning', 'arrest'].includes(label)) {
      return {
        jailtime_check: checks.jailtime_check.bind(this),
        build_consequence: checks.build_consequence.bind(this),
        pledgeCheck: checks.pledgeCheck.bind(this),
        bribeCheck: checks.bribeCheck.bind(this),
        targetPunchedCheck: checks.targetPunchedCheck.bind(this),
      }
    }

    return {}
  }
  handleConfrontation() {
    const target: NpcState | WorldPlayer =
      this.target === 'player'
        ? this.parent.returnPlayer()
        : this.parent.returnNpc(this.target)
    if (
      this.parent.npcHasTask(this.target, 'any', [
        'mender',
        'injury',
        'infirm',
      ]) !== null
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
      print(
        'PLSYRTCONFRONT??:: ',
        this.target == 'player',
        this.owner,
        this.target
      )
    }
  }
  playerConfrontConsequence(playerfsm: StateMachine, npcfsm: StateMachine) {
    playerfsm.setState('confronted')
    npcfsm.setState('confront')
    this.parent.setConfrontation(this)
  }
  npc_confront_consequence() {
    if (this.label == 'arrest')
      this.parent.returnNpc(this.target).fsm.setState('arrestee')
    //testjpf convert rest!!!:::
    const tempcons: Array<
      (s: string, w: string) => { pass: boolean; type: string }
    > = shuffle([
      this.checks.pledgeCheck!.bind(this),
      this.checks.bribeCheck!.bind(this),
      this.checks.targetPunchedCheck!.bind(this),
      this.checks.jailtime_check!.bind(this),
      //admirer_check,
      // prejudice_check,
      // unlucky_check,
    ])
    this.checks.build_consequence!(this, this.owner, tempcons, false)
  }
}

function setInitFSMstate(t: Task): string {
  let state = 'idle'
  if (t.label == 'hallpass') state = 'hallpass'
  else if (['questioning', 'arrest'].includes(t.label)) state = 'confront'
  else if (t.label == 'injury') state = 'injury'
  else if (t.label == 'mender') state = 'medical'
  else if (t.label == 'snitch') state = 'snitch'
  else if (t.label == 'reckless') state = 'reckless'
  else if (['merits', 'demerits'].includes(t.label)) state = 'merit'
  return state
}
