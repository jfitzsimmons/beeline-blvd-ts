import { Npc, Occupants } from '../../types/state'
import { roll_special_dice } from '../utils/dice'
import { clamp, shuffle, surrounding_room_matrix } from '../utils/utils'
import { admirer_check, prejudice_check } from './effectsystem'
import { bribe_check } from './inventorysystem'
import {
  reckless_check,
  suspect_punched_check,
  unlucky_check,
} from './chaossystem'
import { add_pledge, go_to_jail } from './systemshelpers'
import { Caution, Consequence } from '../../types/tasks'
import { Direction } from '../../types/ai'

const { tasks, rooms, npcs, player } = globalThis.game.world
const questioning_checks: Array<
  (s: string, w: string) => { pass: boolean; type: string }
> = [
  pledge_check,
  bribe_check,
  suspect_punched_check,
  jailtime_check,
  admirer_check,
  prejudice_check,
  unlucky_check,
]
const thief_consolations = [
  snitch_check,
  merits_demerits,
  reckless_check,
  //society_check,
]
//Crime Consolations

export const injured_npcs: string[] = []

function merits_demerits(suspect: string, watcher: string): Consequence {
  //print('merits_demertis:: suspect::', suspect)
  const w = npcs.all[watcher]
  const s = suspect === 'player' ? player.state : npcs.all[suspect]

  const modifier = Math.round(
    (w.binaries.evil_good + w.binaries.lawless_lawful) * -2.5
  )
  const advantage =
    w.skills.constitution +
      (w.binaries.passive_aggressive - s.binaries.evil_good) * 5 >
    7.5
  const result = roll_special_dice(5, advantage, 3, 2) + clamp(modifier, -1, 1)

  //print('TESTJPF RESULT::: evilmerits', result)
  if (result < 4) {
    return { pass: true, type: 'demerits' }
  }

  if (result > 8) {
    return { pass: true, type: 'merits' }
  }

  return { pass: false, type: 'neutral' }
}
//Checks and Helpers
//security
function pledge_check(suspect: string, watcher: string): Consequence {
  const w = npcs.all[watcher]
  const s = suspect === 'player' ? player.state : npcs.all[suspect]

  const modifier = Math.round(
    w.binaries.passive_aggressive * -5 + s.binaries.passive_aggressive * 5
  )
  const advantage = w.skills.wisdom > s.skills.constitution + 1
  const result = roll_special_dice(5, advantage, 3, 2) + clamp(modifier, -3, 3)

  //print('TESTJPF RESULT::: pledge', result)
  if (result > 5 && result <= 10) {
    add_pledge(suspect)
    return { pass: true, type: 'pledge' }
  }

  if (result > 10) {
    //print('SPECIAL pledge')
    add_pledge(suspect)
    add_pledge(suspect)
    return { pass: true, type: 'special' }
  }
  if (result <= 1) {
    //print('NEVER pledge')
    return { pass: true, type: 'critical' }
  }

  return { pass: false, type: 'neutral' }
}
export function jailtime_check(suspect: string, watcher: string): Consequence {
  const w = npcs.all[watcher]
  const s = suspect === 'player' ? player.state : npcs.all[suspect]
  const modifier = Math.round(
    w.skills.perception - s.skills.perception + w.binaries.anti_authority * 4
  )
  const advantage = s.binaries.passive_aggressive < 0.2
  const result = roll_special_dice(5, advantage, 3, 2) + clamp(modifier, -3, 3)

  //print('TESTJPF RESULT::: jailed', result)
  if (result > 5 && result <= 10) {
    go_to_jail(suspect)
    return { pass: true, type: 'jailed' }
  }

  if (result > 10) {
    //print('SPECIAL jailed')
    return { pass: true, type: 'special' }
  }
  if (result <= 1) {
    //print('NEVER jailed')
    return { pass: true, type: 'critical' }
  }

  return { pass: false, type: 'neutral' }
}
export function snitch_check(suspect: string, watcher: string): Consequence {
  //print('snitch check suspect::', suspect)
  const w = npcs.all[watcher]
  const s = suspect === 'player' ? player.state : npcs.all[suspect]

  const modifier = Math.round(
    w.binaries.anti_authority * 5 +
      (w.skills.constitution - s.skills.charisma) / 2
  )
  const advantage =
    w.skills.perception + Math.abs(w.binaries.passive_aggressive * 5) >
    s.skills.stealth + +Math.abs(s.binaries.passive_aggressive * 5)
  const result = roll_special_dice(5, advantage, 3, 2) + clamp(modifier, -2, 2)

  //print('TESTJPF RESULT::: snitch', result)
  if (result > 5 && result <= 10) {
    return { pass: true, type: 'snitch' }
  }

  if (result > 10) {
    //print('SPECIAL snitch')
    return { pass: true, type: 'special' }
  }
  if (result <= 1) {
    //print('NEVER snitch')
    return { pass: true, type: 'critical' }
  }

  return { pass: false, type: 'neutral' }
}

//Confrontation /security
function thief_consolation_checks(s: string, w: string) {
  const tempcons: Array<(s: string, w: string) => Consequence> =
    shuffle(thief_consolations)
  tempcons.forEach((c) => {
    const consolation = c(s, w)
    if (consolation.pass == true) return consolation.type
  })
  //print('did nothing after witnessing a theft attempt')
  return 'neutral'
}
export function build_consequence(
  c: Caution,
  checks: Array<(n: string, w: string) => Consequence>,
  precheck = false
) {
  let consolation = { pass: precheck, type: 'neutral' }

  for (let i = checks.length; i-- !== 0; ) {
    consolation = checks[i](c.suspect, c.npc)
    if (consolation.pass == true) break
  }

  if (consolation.pass == false) {
    //if (c.suspect != 'player') {
    consolation.type = thief_consolation_checks(c.suspect, c.npc)
    if (consolation.type != 'neutral') {
      tasks.caution_builder(
        npcs.all[c.npc],
        consolation.type,
        c.suspect,
        c.reason
      )
      c.time = 0
    } else {
      //print(c.label, c.reason, 'ANY_consequence: no fx or cautions')
    }
    //} else {
    //  npcs.all[c.npc].love = npcs.all[c.npc].love - 1
    // }
  }
  //print('BUILD CONEQUENCE return type::', consolation.type)
  return consolation.type
}
function question_consequence(c: Caution) {
  //npconly
  //print('QC::: ', c.npc, 'is NOW questioning:', c.suspect)

  const tempcons: Array<
    (s: string, w: string) => { pass: boolean; type: string }
  > = shuffle(questioning_checks)

  build_consequence(c, tempcons)
  c.time = 0
}
export function npc_confrontation(s: string, c: Caution) {
  if (c.label == 'questioning') {
    question_consequence(c)
  }
  if (c.label == 'arrest') {
    //print('CAUTION:: arrest.', c.npc, 'threw', s, 'in jail')
    go_to_jail(s)
  }
}

//medics:
export function send_to_infirmary(v: string, doc: string) {
  //print('infirmed:', v, ' :::!!!!')
  tasks.remove_heat(v)
  const occupants: Occupants = rooms.all.infirmary.occupants!
  let station: keyof typeof occupants
  for (station in occupants) {
    const patient = occupants[station]
    if (patient == '') {
      rooms.all.infirmary.occupants![station] = v
      npcs.all[v].matrix = rooms.all.infirmary.matrix
      npcs.all[v].cooldown = 8
      npcs.all[v].currentroom = 'infirmary'
      npcs.all[v].currentstation = station
      //print(v, 'infirmed for:', npcs.all[v].cooldown)
      tasks.caution_builder(npcs.all[doc], 'mending', v, 'office')
      break
    }
  }
}

export function freeze_injured_npc(npc: Npc) {
  rooms.all[npc.currentroom].stations[npc.currentstation] = npc.labelname

  const limit = tasks.medicQueue.indexOf(npc.labelname)
  if (limit < 0 || limit > 3) injured_npcs.push(npc.labelname)
}

export function doctor_ai_turn(
  npc: Npc,
  targets: Direction
): [Direction, boolean] {
  const patients = Object.values(rooms.all.infirmary.occupants!).filter(
    (p) => p != ''
  )
  let docInOffice = false

  if (tasks.get_field_docs().includes(npc.labelname) == true) {
    //stay put
    rooms.all[npc.currentroom].stations[npc.currentstation] = npc.labelname
  } else if (
    patients.length > 1 &&
    math.random() + patients.length * 0.1 > 0.6
  ) {
    rooms.all.infirmary.stations.aid = npc.labelname
    docInOffice = true
  } else if (patients.length > 3) {
    targets = surrounding_room_matrix(rooms.all.infirmary.matrix, npc.matrix)
  } else if (injured_npcs.length > 0) {
    //find emergency patient
    targets = surrounding_room_matrix(
      rooms.all[npcs.all[injured_npcs[0]].currentroom].matrix,
      npc.matrix
    )
  }

  return [targets, docInOffice]
}
