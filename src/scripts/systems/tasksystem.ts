import { Npc, PlayerState } from '../../types/state'
import { Caution, Effect, Consequence } from '../../types/tasks'
import { arraymove, shuffle } from '../utils/utils'
import {
  fx,
  add_effects_bonus,
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
  send_to_infirmary,
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

const { tasks, rooms, npcs, player } = globalThis.game.world

const fxLookup = {
  merits: [
    'admirer',
    'inspired',
    'eagleeye',
    'vanity',
    'readup',
    'yogi',
    'angel',
  ],
  demerits: [
    'prejudice',
    'boring',
    'distracted',
    'ignorant',
    'lazy',
    'dunce',
    'devil',
  ],
}

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
function focused_acts(c: Caution) {
  if (c.reason == 'office') {
    if (c.time == 1) {
      npcs.all[c.suspect].hp = 5
      rooms.all.infirmary.occupants![npcs.all[c.suspect].currentstation] = ''
    } else {
      const aid = rooms.all.infirmary.stations.aid
      if (aid != '' && npcs.all[aid].clan == 'doctors') {
        c.time--
      }
    }
  } else if (c.reason == 'field' && c.authority == 'doctors') {
    if (c.time == 1) {
      send_to_infirmary(c.suspect, c.npc)
    } else {
      if (npcs.all[c.npc].currentroom == player.currentroom)
        msg.post(
          `/${npcs.all[c.npc].currentstation}#npc_loader`,
          hash('move_npc'),
          {
            station: npcs.all[c.suspect].currentstation,
            npc: c.npc,
          }
        )
      print(c.npc, 'tending to', c.suspect, 'in the field')
    }
  }
}

//Passive reactions to cautions
function player_snitch_check(b: boolean, w: string, reason: string): string {
  ///testjpf still nrrd to figure out alert_level!!!
  //do alert_level search
  let caution_state = 'questioning'
  if (player.alert_level > 3) caution_state = 'arrest'
  player.alert_level =
    b == false ? player.alert_level + 1 : player.alert_level + 2
  if (player.alert_level > 5 && tasks.plan_on_snitching(w, 'player') == false) {
    tasks.caution_builder(npcs.all[w], 'snitch', 'player', reason)
  }
  print('plauer snith chk :: alertlvl::', player.alert_level)
  return caution_state
}
function npc_snitch_check(w: string, s: string) {
  let caution_state = 'questioning'

  if (tasks.already_hunting(w, s)) {
    npcs.all[w].attitudes[npcs.all[s].clan] =
      npcs.all[w].attitudes[npcs.all[s].clan] - 1

    if (math.random() < 0.33) caution_state = 'arrest'
  }
  return caution_state
}
function adjust_medic_queue(patient: string) {
  if (tasks.mendingQueue.includes(patient) == true) {
    if (tasks.mendingQueue.indexOf(patient) > 1)
      arraymove(tasks.mendingQueue, tasks.mendingQueue.indexOf(patient), 0)
  } else {
    print('cautions caused patient:', patient, 'to be added to mendingQueue')
    tasks.mendingQueue.push(patient)
  }
}
function handle_temp_clearance(level: string, cleared: string, time: number) {
  const levelNum: number = tonumber(level.charAt(level.length - 1))!
  print('time clearance too low::??', time)
  if (time > 1) {
    cleared == 'player'
      ? (player.clearance = levelNum)
      : (npcs.all[cleared].clearence = levelNum)
  } else {
    cleared == 'player'
      ? (player.clearance = player.clearance - levelNum)
      : (npcs.all[cleared].clearence = npcs.all[cleared].clearence - levelNum)
  }
}
function merits_demerits(c: Caution, w: string) {
  if (c.suspect === 'player') {
    const adj = c.label === 'merits' ? 1 : -1
    npcs.all[w].love = npcs.all[w].love + adj
  }
  const fxArray: string[] =
    c.label === 'merits' ? fxLookup.merits : fxLookup.demerits
  const fx_labels = shuffle(fxArray)
  const effect: Effect = fx[fx_labels[0]]!
  if (effect.fx.type == 'attitudes') {
    effect.fx.stat = npcs.all[c.suspect].clan
  }
  print(c.npc, 'found:', w, 'because merits.', w, 'has effect:', fx_labels[1])
  npcs.all[w].effects.push(effect)
  add_effects_bonus(npcs.all[w], effect)
}
function reckless_consequence(c: Caution, _w: string) {
  print('RC::: ', c.npc, ' is gossiping with', _w)
  const checks: Array<(n: string, _w: string) => Consequence> =
    c.reason == 'theft'
      ? shuffle(reck_theft_checks)
      : shuffle(reck_harass_checks)

  build_consequence(c, checks)
}
function snitch_to_security(c: Caution, watcher: string) {
  print(c.npc, 'SNITCHED on:', c.suspect, 'TO:', watcher)
  const bulletin = tasks.already_hunting(watcher, c.suspect)
  const caution_state =
    c.suspect == 'player'
      ? player_snitch_check(bulletin == null, watcher, c.reason)
      : npc_snitch_check(watcher, c.suspect)

  if (bulletin == null) {
    tasks.caution_builder(npcs.all[watcher], caution_state, c.suspect, c.reason)
  } else {
    bulletin.time = bulletin.time + 6
  }

  c.time = 0
}
function passive_acts(c: Caution, w: string) {
  if (c.label == 'reckless') {
    reckless_consequence(c, w)
  } else if (c.label == 'injury') {
    adjust_medic_queue(c.suspect)
  } else if (
    c.authority == 'security' &&
    c.label == 'snitch' &&
    (c.authority == npcs.all[w].clan || c.authority == npcs.all[w].labelname)
  ) {
    snitch_to_security(c, w)
  } else if (
    (c.label == 'merits' || c.label == 'demerits') &&
    (npcs.all[w].clan == c.authority ||
      npcs.all[c.npc].attitudes[npcs.all[w].clan] > 0)
  ) {
    merits_demerits(c, w)
  }
}

//player interaction and npc actions
export function confrontation_consequence(
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
  const caution: Caution = {
    npc: w,
    time: 1,
    label: 'confront',
    type: 'clan',
    authority: npcs.all[w].clan,
    suspect: s,
    reason: 'theft',
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

//Caution Categories
function address_confrontations(cs: Caution[]): Caution | null {
  //let confront: Confront | null = null

  for (let i = cs.length - 1; i >= 0; i--) {
    const c = cs[i]
    const agent = npcs.all[c.npc]
    const suspect: Npc | PlayerState =
      c.suspect === 'player' ? player.state : npcs.all[c.suspect]

    if (
      agent.currentroom == suspect.currentroom ||
      (agent.currentroom == suspect.exitroom &&
        agent.exitroom == suspect.currentroom)
    ) {
      c.suspect !== 'player' && npc_confrontation(suspect.labelname, c)
      c.time = 0
      // confront =
      return c.suspect == 'player' ? c : null
    }
    // if (confront != null) break
  }
  return null
}
function address_conversations(cs: Caution[]) {
  for (let i = cs.length - 1; i >= 0; i--) {
    const agent = npcs.all[cs[i].npc]
    const stations = rooms.all[agent.currentroom].stations
    let station: keyof typeof stations
    for (station in stations) {
      const watcher = stations[station]
      //loop through stations in room of task agent
      if (watcher != '' && watcher != cs[i].npc && watcher != cs[i].suspect) {
        passive_acts(cs[i], watcher)
      }
    }
  }
}
function address_admin(cs: Caution[]) {
  for (let i = cs.length - 1; i >= 0; i--) {
    handle_temp_clearance(cs[i].type, cs[i].suspect, cs[i].time)
  }
}
function address_busy_acts(cs: Caution[]) {
  for (let i = cs.length - 1; i >= 0; i--) {
    focused_acts(cs[i])
  }
}

//LEVEL Cautions
export function address_cautions() {
  //testjpf why sort by time??
  //needs better naming conventions
  const sortedCautions = tasks.cautions.sort(
    (a: Caution, b: Caution) => a.time - b.time
  )
  const { confrontational, leftovercautions } = sortedCautions.reduce(
    (r: { [key: string]: Caution[] }, o: Caution) => {
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
    (r: { [key: string]: Caution[] }, o: Caution) => {
      r[o.label == 'mending' ? 'medical' : 'conversational'].push(o)
      return r
    },
    { medical: [], conversational: [] }
  )
  const { clearance, conversational2 } = conversational.reduce(
    (r: { [key: string]: Caution[] }, o: Caution) => {
      r[o.label == 'clearance' ? 'clearance' : 'conversational2'].push(o)
      return r
    },
    { clearance: [], conversational2: [] }
  )
  address_admin(clearance)
  address_conversations(conversational2)
  address_busy_acts(medical)
  const confront: Caution | null = address_confrontations(confrontational)

  for (let i = sortedCautions.length - 1; i >= 0; i--) {
    print(
      'sortedCautions[i].label & NPC',
      sortedCautions[i].label,
      sortedCautions[i].npc
    )
    sortedCautions[i].time--
    if (sortedCautions[i].time <= 0) {
      sortedCautions.splice(i, 1)
    }
  }
  return confront
}
