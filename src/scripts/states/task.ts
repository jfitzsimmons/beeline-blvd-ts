/* eslint-disable @typescript-eslint/no-empty-function */

import {
  // Consequence,
  Effect,
  Task,
  TaskProps,
  TasksChecks,
} from '../../types/tasks'
//import { build_consequence } from '../systems/emergencysystem'
//import { reck_theft_checks, reck_harass_checks } from '../systems/tasksystem'
//import { add_effects_bonus } from '../utils/ai'
import { fxLookup, fx } from '../utils/consts'
import { shuffle } from '../utils/utils'
import { NpcsInitState } from './inits/npcsInitState'
import { PlayerInitState } from './inits/playerInitState'
import StateMachine from './stateMachine'

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
    //TESTJPF REDO need some sort of world.adjustClearance()
    const holder =
      this.owner == 'player'
        ? this.parent.returnPlayer()
        : this.parent.returnNpc(this.owner)

    holder.clearance = tonumber(this.scope.charAt(this.scope.length - 1))!
  }
  private onHallpassUpdate(): void {
    //print('hpassupdate:: turn', this.turns)
    if (this.turns < 1) {
      const holder =
        this.owner == 'player'
          ? this.parent.returnPlayer()
          : this.parent.returnNpc(this.owner)
      //print('onHallpassupr', PlayerInitState.clearance, holder.clearance)
      holder.clearance =
        this.owner === 'player'
          ? PlayerInitState.clearance
          : NpcsInitState[this.owner].clearance
    }
  }
  private onHallpassExit(): void {}
  private onConfrontEnter(): void {}
  private onConfrontUpdate(): void {}
  private onConfrontExit(): void {}
  private onConverseEnter(): void {}
  private onConverseUpdate(): void {}
  private onConverseExit(): void {}
  private onMedicalEnter(): void {}
  private onMedicalUpdate(): void {}
  private onMedicalExit(): void {}
  private onMeritEnter(): void {}
  private onMeritUpdate(): void {
    const owner = this.parent.returnNpc(this.owner)
    print('MERTIS:: TASK:', owner.name, owner.currRoom)
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
      //TESTJPF TODO NOW:: this.addEffectsBonus(effect)!!!
      listener.add_effects_bonus(effect)
      break
    }
  }
  private onMeritExit(): void {}
  private onRecklessEnter(): void {}
  private onRecklessUpdate(): void {
    /** 
    const owner = this.parent.returnNpc(this.owner)
    // const target = this.parent.returnNpc(this.target)
    //print('MERTIS:: TASK:', owner.name, owner.currRoom)
    const others = this.parent
      .getOccupants(owner.currRoom)
      .filter((o) => o !== this.owner)
    for (const npc of others) {
      //  const listener = this.parent.returnNpc(npc)
      const checks: Array<(target: Traits, listener: Traits) => Consequence> =
        this.cause == 'theft'
          ? shuffle([this.checks.recktheft1, this.checks.recktheft2])
          : shuffle([this.checks.reckharass1, this.checks.reckharass2])
      //          ? shuffle(reck_theft_checks)
      //        : shuffle(reck_harass_checks)

      build_consequence(this, checks)
    }
      */
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
    }

    return {}
  }
  /** 
  //testjpf move 2 checks to parent
  //use new init
  // will need individual method Types 'per task'
  // some tasks wont have any
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
      cop.traits.opinion[target.clan] = cop.traits.opinion[target.clan] - 1
      print('NPCSNITCHCHK')
      if (math.random() < 0.33) caution_state = 'arrest'
    }
    return caution_state
  }*/
}
// testjpf maybe combine following into 1 step.
// like npc attributes:::
function setInitFSMstate(t: Task): string {
  let state = 'idle'
  if (t.label == 'hallpass') state = 'hallpass'
  else if (t.label == 'injury') {
    state = 'injury'
  } else if (t.label == 'mender') {
    state = 'medical'
  } else if (t.label == 'snitch') state = 'snitch'
  else if (t.label == 'reckless') state = 'reckless'
  else if (['merits', 'demerits'].includes(t.label)) state = 'merit'
  return state
}
