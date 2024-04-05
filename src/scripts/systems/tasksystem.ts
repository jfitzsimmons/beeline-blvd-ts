import {
  Caution,
  Confront,
  Npc,
  PlayerState,
  Effect,
  Consequence,
} from '../../types/state'
import { roll_special_dice } from '../utils/dice'
import { arraymove, clamp, shuffle } from '../utils/utils'
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
import { remove_advantageous } from '../systems/inventorysystem'
import {
  build_consequence,
  npc_confrontation,
  send_to_infirmary,
  snitch_check,
} from './emergencysystem'
import {
  reckless,
  suspect_punched_check,
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
]

const pos_consolations = [charmed_merits, ap_boost, given_gift, love_boost]
const neg_consolations = [reckless, love_drop]
const reck_theft_checks = [ignorant_check, dumb_crook_check, chaotic_good_check]
const reck_harass_checks = [classy_check, predator_check]

//positive consolations
function generate_gift() {
  player.state.inventory.push('berry02')
}
function given_gift(n: string): Consequence {
  //testjpf check if inventory full?!
  const gift = remove_advantageous(
    player.state.inventory,
    npcs.all[n].inventory,
    player.state.skills
  )

  if (gift == null) generate_gift()
  return { pass: true, type: 'gift' }
}
function love_boost(n: string): Consequence {
  const npc = npcs.all[n]

  const modifier = Math.round(
    Math.abs(player.state.binaries.evil_good) * 10 - npc.skills.speed
  )
  const advantage =
    player.state.skills.charm +
      player.state.skills.intelligence +
      npc.binaries.anti_authority * 10 >
    npc.skills.intelligence + npc.skills.perception + player.state.skills.speed
  const result = math.min(
    roll_special_dice(5, advantage, 3, 2) + (modifier > -2 ? modifier : -2),
    roll_special_dice(5, advantage, 3, 2) + clamp(modifier, -3, 3)
  )
  //const result =
  // roll_special_dice(5, advantage, 3, 2) + (modifier > -1 ? modifier : -1)

  print('TESTJPF RESULT::: loveboost', result)
  if (result > 5 && result <= 10) return { pass: true, type: 'loveboost' }

  if (result > 10) return { pass: true, type: 'special' }
  return { pass: false, type: 'neutral' }
}
function ap_boost(n: string): Consequence {
  const npc = npcs.all[n]

  const modifier = Math.round(
    player.state.skills.constitution +
      npc.love +
      (npc.binaries.passive_aggressive * 10) / 3
  )
  const advantage =
    player.state.binaries.passive_aggressive + npc.binaries.passive_aggressive >
      0.1 && npc.skills.constitution > player.state.skills.speed
  const result =
    roll_special_dice(5, advantage, 3, 2) + (modifier > -1 ? modifier : -1)

  print('TESTJPF RESULT::: apboost', result)
  if (result > 5 && result <= 10) return { pass: true, type: 'apboost' }

  if (result > 10) return { pass: true, type: 'special' }
  return { pass: false, type: 'neutral' }
}
function charmed_merits(n: string): Consequence {
  //testjpf GOOD time for a diceroll
  const npc = npcs.all[n]

  //so
  /**
   * what advantages do we want to give? npc love? not a bin or skill

   */

  const modifier = Math.round(
    (player.state.skills.charisma + npc.love) / 2 - npc.skills.constitution
  )
  const advantage =
    player.state.skills.charisma > npc.skills.charisma &&
    npc.binaries.un_educated < -0.1
  const result =
    roll_special_dice(5, advantage, 3, 2) + (modifier > -1 ? modifier : -1)

  print('TESTJPF RESULT:::charmedmerits', result)
  if (result > 5 && result <= 10) return { pass: true, type: 'merits' }

  if (result > 10) return { pass: true, type: 'special' }
  //won't like you,
  // slander you to people close to them / who like them / they like / cohort with
  // decreases others love for player

  return { pass: false, type: 'neutral' }
}

//negative consolations
function love_drop(n: string): Consequence {
  const npc = npcs.all[n]

  const modifier = Math.round(
    player.state.skills.wisdom +
      player.state.binaries.un_educated * 10 -
      npc.skills.charisma +
      Math.abs(npc.binaries.evil_good * 10)
  )
  const advantage =
    player.state.skills.speed + player.state.binaries.lawless_lawful * 10 >
    npc.binaries.evil_good * 10 + npc.skills.constitution
  const result = math.min(
    roll_special_dice(5, advantage, 3, 2) + (modifier > -1 ? modifier : -1),
    roll_special_dice(5, advantage, 3, 2) + (modifier > -2 ? modifier : -2)
  )
  //const result =
  // roll_special_dice(5, advantage, 3, 2) + (modifier > -1 ? modifier : -1)

  if (result > 1 && result < 5) return { pass: true, type: 'lovedrop' }

  if (result <= 1) return { pass: true, type: 'critical' }
  return { pass: false, type: 'neutral' }
}

//Focused actions
function focused_acts(c: Caution) {
  if (c.reason == 'office') {
    if (c.time == 1) {
      npcs.all[c.suspect].hp = 5
      rooms.all.infirmary.occupants![npcs.all[c.suspect].currentstation] = ''
    } else {
      const aid = rooms.all.infirmary.stations.aid
      if (aid != '' && npcs.all[aid].clan == 'doctors') {
        npcs.all[c.npc].currentroom = 'infirmary'
        npcs.all[c.npc].currentstation = 'aid'
      }
    }
  } else if (c.reason == 'field') {
    if (c.time == 1) {
      send_to_infirmary(c.suspect, c.npc)
    } else {
      // testjpfsame code as ai_checks tendtopatient
      const vstation = npcs.all[c.suspect].currentstation
      const dstation = npcs.all[c.npc].currentstation
      if (npcs.all[c.npc].currentroom == player.currentroom)
        msg.post(`/${dstation}#npc_loader`, hash('move_npc'), {
          station: vstation,
          npc: c.npc,
        })
      print(c.npc, 'tending to', c.suspect, 'in the field')
    }
  }
}

//Passive reactions to cautions
function player_snitch_check(b: boolean, w: string, reason: string): string {
  let caution_state = 'questioning'
  if (player.alert_level > 1) caution_state = 'arrest'
  player.alert_level =
    b == false ? player.alert_level + 1 : player.alert_level + 2
  if (player.alert_level > 2 && tasks.plan_on_snitching(w, 'player') == false) {
    tasks.caution_builder(npcs.all[w], 'snitch', 'player', reason)
  }
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
function adjust_medic_queue(s: string) {
  if (tasks.medicQueue.includes(s) == true) {
    if (tasks.medicQueue.indexOf(s) > 1)
      arraymove(tasks.medicQueue, tasks.medicQueue.indexOf(s), 0)
  } else {
    print('cautions caused s:', s, 'to be added to medicQueue')
    tasks.medicQueue.push(s)
  }
}
function merits_demerits(c: Caution, w: string) {
  if (c.suspect === 'player') {
    const adj = c.label === 'merits' ? 1 : -1
    npcs.all[w].love = npcs.all[w].love + adj
  }
  const fxArray = c.label === 'merits' ? fxLookup.merits : fxLookup.demerits
  const fx_labels = shuffle(fxArray)
  const effect: Effect = { ...fx[fx_labels[1]] }
  if (effect.fx.type == 'attitudes') {
    effect.fx.stat = npcs.all[c.suspect].clan
  }
  print(c.npc, 'found:', w, 'because merits.', w, 'has effect:', fx_labels[1])
  npcs.all[w].effects.push(effect)
  add_effects_bonus(npcs.all[w], effect)
}
function reckless_consequence(c: Caution, w: string) {
  print('RC::: ', c.npc, ' is gossiping with', w)
  //const watcher = npcs.all[w]
  const checks: Array<(n: string, w: string) => Consequence> =
    c.reason == 'theft'
      ? shuffle(reck_theft_checks)
      : shuffle(reck_harass_checks)

  build_consequence(c, checks)
}
function snitch_to_security(c: Caution, watcher: string) {
  print(c.npc, 'SNITCHED')
  const bulletin = tasks.already_hunting(watcher, c.suspect)
  let caution_state = 'questioning'

  if (bulletin == null) {
    tasks.caution_builder(npcs.all[watcher], caution_state, c.suspect, c.reason)
  } else {
    bulletin.time = bulletin.time + 6
  }

  caution_state =
    c.suspect == 'player'
      ? player_snitch_check(bulletin == null, watcher, c.reason)
      : npc_snitch_check(watcher, c.suspect)
  c.time = 0
}
function passive_acts(c: Caution, w: string) {
  if (c.label == 'reckless') {
    reckless_consequence(c, w)
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
  } else if (c.label == 'injury') {
    adjust_medic_queue(c.suspect)
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
export function unimpressed_checks(n: string) {
  const tempcons: Array<(n: string) => Consequence> = shuffle(neg_consolations)
  tempcons.forEach((c) => {
    const consolation = c(n)
    if (consolation.pass == true) return consolation.type
  })
  print('did nothing after witnessing a theft attempt')
  return 'neutral'
}
export function impressed_checks(n: string) {
  const tempcons: Array<(n: string) => Consequence> = shuffle(pos_consolations)
  tempcons.forEach((c) => {
    const consolation = c(n)
    if (consolation.pass == true) return consolation.type
  })
  print('did nothing after witnessing a theft attempt')
  return 'neutral'
}

//Caution Categories
function address_confrontations(cs: Caution[]) {
  let confront: Confront | null = null

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
      confront =
        c.suspect == 'player'
          ? {
              npc: c.npc,
              station: '',
              state: c.label,
              reason: c.reason,
            }
          : null
    }
    if (confront != null) break
  }
  return confront
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
function address_busy_acts(cs: Caution[]) {
  for (let i = cs.length - 1; i >= 0; i--) {
    focused_acts(cs[i])
  }
}

//LEVEL Cautions
export function address_cautions() {
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

  const confront: Confront | null = address_confrontations(confrontational)

  address_busy_acts(medical)
  address_conversations(conversational)

  for (let i = sortedCautions.length - 1; i >= 0; i--) {
    sortedCautions[i].time--
    if (sortedCautions[i].time <= 0) sortedCautions.splice(i, 1)
    //if (confront != null) break
  }
  //testjpf could see adding more data to this return
  return confront
}
