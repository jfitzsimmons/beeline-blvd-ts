import { Task, Consequence } from '../../types/tasks'
import { shuffle } from '../utils/utils'
import {
  prejudice_check,
  vanity_check,
  angel_check,
  //chaotic_good_check,
  //classy_check,
  //dumb_crook_check,
  //ignorant_check,
  //predator_check,
} from '../systems/effectsystem'

import {
  neg_consolations,
  pos_consolations,
  suspect_punched_check,
  suspicious_check,
  unlucky_check,
  watcher_punched_check,
} from './chaossystem'

const { tasks, npcs, player } = globalThis.game.world

const confrontation_checks: Array<
  (s: string, w: string) => { pass: boolean; type: string }
> = [
  vanity_check,
  angel_check,
  suspect_punched_check,
  watcher_punched_check,
  //snitch_check,
  prejudice_check,
  unlucky_check,
  suspicious_check,
]
/**
export const reck_theft_checks = [
  ignorant_check,
  dumb_crook_check,
  chaotic_good_check,
]*/
// testjpf move these next!! reusing above in fsm for testing
//export const reck_harass_checks = [classy_check, predator_check]

//Focused actions
//todo doctor npc state
//function focused_acts(c: Task) {}
/**
function reckless_consequence(c: Task) {
  //print('RC::: ', c.owner, ' is gossiping with', _w)
  const checks: Array<(n: string, _w: string) => Consequence> =
    c.cause == 'theft'
      ? shuffle(reck_theft_checks)
      : shuffle(reck_harass_checks)

  build_consequence(c, checks)
}
*/

//player interaction and npc actions
export function confrontationConsequence(
  s: string,
  w: string,
  precheck = false
) {
  let tempcons: Array<(s: string, w: string) => Consequence> = []
  //let precheck = true
  //const consolation = { pass: true, type: 'concern' }
  if (s != 'player') {
    tempcons = shuffle(confrontation_checks)
    //precheck = false
  }
  const caution: Task = {
    owner: w,
    turns: 1,
    label: 'confront',
    scope: 'clan',
    authority: npcs.all[w].clan,
    target: s,
    cause: 'theft',
  }
  const consequence = tasks.checks.build_consequence(
    caution,
    w,
    tempcons,
    precheck == true && s == 'player'
  )

  return precheck == true && s == 'player' ? 'concern' : consequence
}
//NOVEL
export function unimpressed_checks(s: string, w: string) {
  const tempcons: Array<(s: string, w: string) => Consequence> =
    shuffle(neg_consolations)
  tempcons.forEach((c) => {
    const consolation = c(s, w)
    if (consolation.pass == true) return consolation.type
  })

  return 'neutral'
}
export function impressed_checks(s: string, w: string) {
  const tempcons: Array<(s: string, w: string) => Consequence> =
    shuffle(pos_consolations)
  tempcons.forEach((c) => {
    const consolation = c(s, w)
    if (consolation.pass == true) return consolation.type
  })

  return 'neutral'
}

//Task Categories
//TESTJPF NOW!!! Need to figure out how to
// make fsm? trigger level confrontations?
//player.setState('confront)??
// needs to set novel stuff and adjust npc convos also
/** 
function address_confrontations(cs: Task[]): void {
  //let confront: Confront | null = null
  // for (let i = cs.length - 1; i >= 0; i--) {
  //   const c = cs[i]
  const owner = npcs.all[this.owner]
  const target: NpcState | PlayerState =
    this.target === 'player' ? player.state : npcs.all[this.target]

  if (
    owner.currRoom == target.currRoom ||
    (owner.currRoom == target.exitRoom && owner.exitRoom == target.currRoom)
  ) {
    this.target !== 'player' && npc_confrontation(this.target, c)
    this.turns = 0
    // confront =
    print(
      'PLSYRTCONFRONT??:: ',
      this.target == 'player',
      this.owner,
      this.target
    )
    //shouldnt return a task, but make novel changes, etthis..
    // return this.target == 'player' ? c : null
  }
  // if (confront != null) break
  // }
  //return null
}*/

export function address_busy_tasks() {
  const ts = tasks.all.filter((t) => t.label == 'mender')
  for (let i = ts.length - 1; i >= 0; i--) {
    if (ts[i].cause == 'injury' && ts[i].label == 'mender') {
      const hurt = npcs.all[ts[i].target].hp < 5
      if (npcs.all[ts[i].owner].currRoom == player.currRoom && hurt == true) {
        msg.post(
          `/${npcs.all[ts[i].owner].currStation}#npc_loader`,
          hash('move_npc'),
          {
            station: npcs.all[ts[i].target].currStation,
            npc: ts[i].owner,
          }
        )
        print(
          ts[i].owner,
          'STATION MOVE VIA TASK mending',
          ts[i].target,
          'in',
          npcs.all[ts[i].owner].currRoom
        )
      }
      if (hurt == false) {
        ts[i].turns = 0
        npcs.all[ts[i].owner].fsm.setState('turn')
      }
    }
  }
}

//export function address_cautions() {
// const sortedTasks = tasks.all.sort((a: Task, b: Task) => a.turns - b.turns)
/** 
  const { leftovercautions } = sortedTasks.reduce(
    (r: { [key: string]: Task[] }, o: Task) => {
      r[
        o.label == 'questioning' || o.label == 'arrest'
          ? 'confrontational'
          : 'leftovercautions'
      ].push(o)
      return r
    },
    { confrontational: [], leftovercautions: [] }
  )*/

//address_busy_acts()

//TESTJPF NOW!!! Need to figure out how to
// make fsm? trigger level confrontations?
//player.setState('confront)??
// needs to set novel stuff and adjust npc convos also
//const confront: Task | null = address_confrontations(confrontational)

//return confront
//}
