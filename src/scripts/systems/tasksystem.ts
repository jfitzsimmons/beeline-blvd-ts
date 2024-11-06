import { PlayerState } from '../../types/state'
import { Task, Consequence } from '../../types/tasks'
import { shuffle } from '../utils/utils'
import {
  prejudice_check,
  vanity_check,
  angel_check,
  chaotic_good_check,
  classy_check,
  dumb_crook_check,
  ignorant_check,
  predator_check,
} from '../systems/effectsystem'
import {
  build_consequence,
  npc_confrontation,
  //sendToInfirmary,
  snitch_check,
} from './emergencysystem'
import {
  neg_consolations,
  pos_consolations,
  suspect_punched_check,
  suspicious_check,
  unlucky_check,
  watcher_punched_check,
} from './chaossystem'
import NpcState from '../states/npc'

const { tasks, rooms, npcs, player } = globalThis.game.world

const confrontation_checks: Array<
  (s: string, w: string) => { pass: boolean; type: string }
> = [
  vanity_check,
  angel_check,
  suspect_punched_check,
  watcher_punched_check,
  snitch_check,
  prejudice_check,
  unlucky_check,
  suspicious_check,
]

const reck_theft_checks = [ignorant_check, dumb_crook_check, chaotic_good_check]
const reck_harass_checks = [classy_check, predator_check]

//Focused actions
//todo doctor npc state
function focused_acts(c: Task) {
  if (c.cause == 'injury' && c.label == 'mender') {
    const hurt = npcs.all[c.target].hp < 5
    if (npcs.all[c.owner].currRoom == player.currRoom && hurt == true) {
      msg.post(
        `/${npcs.all[c.owner].currStation}#npc_loader`,
        hash('move_npc'),
        {
          station: npcs.all[c.target].currStation,
          npc: c.owner,
        }
      )
      print(
        c.owner,
        'STATION MOVE VIA TASK mending',
        c.target,
        'in',
        npcs.all[c.owner].currRoom
      )
    }
    if (hurt == false) {
      c.turns = 0
      npcs.all[c.owner].fsm.setState('turn')
    }
  }
}

//Passive reactions to cautions
/** 
export function player_snitch_check(
  b: boolean,
  w: string,
  reason: string
): string {
  ///testjpf still nrrd to figure out alert_level!!!
  //do alert_level search
  let caution_state = 'questioning'
  if (player.alert_level > 3) caution_state = 'arrest'
  player.alert_level =
    b == false ? player.alert_level + 1 : player.alert_level + 2
  if (player.alert_level > 5 && tasks.plan_on_snitching(w, 'player') == false) {
    tasks.taskBuilder(w, 'snitch', 'player', reason)
  }
  print('plauer snith chk :: alertlvl::', player.alert_level)
  return caution_state
}
export function npc_snitch_check(w: string, s: string) {
  let caution_state = 'questioning'

  if (tasks.already_hunting(w, s)) {
    npcs.all[w].opinion[npcs.all[s].clan] =
      npcs.all[w].opinion[npcs.all[s].clan] - 1

    if (math.random() < 0.33) caution_state = 'arrest'
  }
  return caution_state
}

function meritsDemerits(c: Task, w: string) {
  if (c.target === 'player') {
    const adj = c.label === 'merits' ? 1 : -1
    npcs.all[w].love = npcs.all[w].love + adj
  }
  const fxArray: string[] =
    c.label === 'merits' ? fxLookup.merits : fxLookup.demerits
  const fx_labels = shuffle(fxArray)
  const effect: Effect = fx[fx_labels[0]]!
  if (effect.fx.type == 'opinion') {
    effect.fx.stat = npcs.all[c.target].clan
  }
  print(c.owner, 'found:', w, 'because merits.', w, 'has effect:', fx_labels[1])
  //check if they already have effect? testjpf
  npcs.all[w].effects.push(effect)
  add_effects_bonus(npcs.all[w], effect)
}*/
function reckless_consequence(c: Task, _w: string) {
  print('RC::: ', c.owner, ' is gossiping with', _w)
  const checks: Array<(n: string, _w: string) => Consequence> =
    c.cause == 'theft'
      ? shuffle(reck_theft_checks)
      : shuffle(reck_harass_checks)

  build_consequence(c, checks)
}
/** 
function snitch_to_security(c: Task, watcher: string) {
  //testjpf need to update aler level
  // update any npc stat
  print(c.owner, 'SNITCHED on:', c.target, 'TO:', watcher)
  const bulletin = tasks.already_hunting(watcher, c.target)
  const caution_state =
    c.target == 'player'
      ? player_snitch_check(bulletin == null, watcher, c.cause)
      : npc_snitch_check(watcher, c.target)

  if (bulletin == null) {
    tasks.taskBuilder(watcher, caution_state, c.target, c.cause)
  } else {
    bulletin.turns = bulletin.turns + 6
  }

  c.turns = 0
}*/
function passive_acts(c: Task, w: string) {
  if (c.label == 'reckless') {
    reckless_consequence(c, w)
  } else if (
    c.authority == 'security' &&
    c.label == 'snitch' &&
    (c.authority == npcs.all[w].clan || c.authority == npcs.all[w].name)
  ) {
    // snitch_to_security(c, w)
  } //else if (
  // (c.label == 'merits' || c.label == 'demerits') &&
  //(npcs.all[w].clan == c.authority ||
  // npcs.all[c.owner].opinion[npcs.all[w].clan] > 0)
  //) {
  // meritsDemerits(c, w)
  // }
}

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
  const consequence = build_consequence(
    caution,
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
function address_confrontations(cs: Task[]): Task | null {
  //let confront: Confront | null = null

  for (let i = cs.length - 1; i >= 0; i--) {
    print(
      ' 00::PLSYRTCONFRONT??:: ',
      cs[i].target == 'player',
      cs[i].owner,
      cs[i].target
    )

    const c = cs[i]
    const owner = npcs.all[c.owner]
    const target: NpcState | PlayerState =
      c.target === 'player' ? player.state : npcs.all[c.target]
    print(
      '11:: PLSYRTCONFRONT??:: ',
      owner.currRoom == target.currRoom,
      owner.currRoom,
      target.currRoom
    )
    if (
      owner.currRoom == target.currRoom ||
      (owner.currRoom == target.exitRoom && owner.exitRoom == target.currRoom)
    ) {
      c.target !== 'player' && npc_confrontation(c.target, c)
      c.turns = 0
      // confront =
      print('PLSYRTCONFRONT??:: ', c.target == 'player', c.owner, c.target)
      return c.target == 'player' ? c : null
    }
    // if (confront != null) break
  }
  return null
}
function address_conversations(cs: Task[]) {
  for (let i = cs.length - 1; i >= 0; i--) {
    const agent = npcs.all[cs[i].owner]
    const stations = rooms.all[agent.currRoom].stations
    let station: keyof typeof stations
    for (station in stations) {
      const watcher = stations[station]
      //loop through stations in room of task agent
      if (watcher != '' && watcher != cs[i].owner && watcher != cs[i].target) {
        passive_acts(cs[i], watcher)
      }
    }
  }
} /** 
function address_admin(cs: Task[]) {
  for (let i = cs.length - 1; i >= 0; i--) {
    handle_temp_clearance(cs[i].scope, cs[i].owner, cs[i].turns)
  }
}*/
function address_busy_acts(cs: Task[]) {
  for (let i = cs.length - 1; i >= 0; i--) {
    focused_acts(cs[i])
  }
}

//so this will be Tasks state turn which will loop thru
// each Task. I think each task's state should be set to it's
//label "clearance", "reckless" on creation
// then task.update()
//LEVEL Tasks
export function address_cautions() {
  const sortedTasks = tasks.all.sort((a: Task, b: Task) => a.turns - b.turns)
  const { confrontational, leftovercautions } = sortedTasks.reduce(
    (r: { [key: string]: Task[] }, o: Task) => {
      r[
        o.label == 'questioning' || o.label == 'arrest'
          ? 'confrontational'
          : 'leftovercautions'
      ].push(o)
      return r
    },
    { confrontational: [], leftovercautions: [] }
  )
  const { medical, conversational } = leftovercautions.reduce(
    (r: { [key: string]: Task[] }, o: Task) => {
      r[o.label == 'mender' ? 'medical' : 'conversational'].push(o)
      return r
    },
    { medical: [], conversational: [] }
  )

  //testjpf change to filter
  const { conversational2 } = conversational.reduce(
    (r: { [key: string]: Task[] }, o: Task) => {
      r[o.label == 'clearance' ? 'clearance' : 'conversational2'].push(o)
      return r
    },
    { clearance: [], conversational2: [] }
  )
  //address_admin(clearance)
  address_conversations(conversational2)
  address_busy_acts(medical)
  const confront: Task | null = address_confrontations(confrontational)

  return confront
}
