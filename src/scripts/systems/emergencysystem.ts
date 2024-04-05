import { Caution, Consequence, Occupants } from '../../types/state'
import { roll_special_dice } from '../utils/dice'
import { clamp, shuffle } from '../utils/utils'
import { admirer_check, prejudice_check } from './effectsystem'
import { bribe_check } from './inventorysystem'
import { reckless, suspect_punched_check, unlucky_check } from './chaossystem'
import { add_pledge, go_to_jail } from './systemshelpers'

const { tasks, rooms, npcs } = globalThis.game.world
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
const thief_consolations = [snitch, evil_merits, reckless]
//Crime Consolations
function snitch(n: string): Consequence {
  if (npcs.all[n].binaries.anti_authority > -0.8) {
    //tell authority they have good attitude towards
    return { pass: true, type: 'snitch' }
  }
  return { pass: false, type: 'neutral' }
}
function evil_merits(n: string): Consequence {
  if (
    npcs.all[n].binaries.evil_good < -0.1 &&
    npcs.all[n].binaries.lawless_lawful < -0.1
  ) {
    return { pass: true, type: 'merits' }
  } else if (
    npcs.all[n].binaries.passive_aggressive < -0.3 ||
    npcs.all[n].skills.constitution < 4
  )
    return { pass: true, type: 'demerits' }

  //won't like you,
  // slander you to people close to them / who like them / they like / cohort with
  // decreases others love for player

  return { pass: false, type: 'neutral' }
}
//Checks and Helpers
//security
function pledge_check(suspect: string, watcher: string): Consequence {
  // wb.passive_aggressive <= sb.passive_aggressive &&
  // ws.wisdom >= ss.constitution

  //testjpf GOOD time for a diceroll
  const w = npcs.all[watcher]
  const s = npcs.all[suspect]
  //so
  /**
   * what advantages do we want to give? w love? not a bin or skill
   */

  const modifier = Math.round(
    w.binaries.passive_aggressive * -5 + s.binaries.passive_aggressive * 5
  )
  const advantage = w.skills.wisdom > s.skills.constitution + 1
  const result = roll_special_dice(5, advantage, 3, 2) + clamp(modifier, -3, 3)

  print('TESTJPF RESULT::: pledge', result)
  if (result > 5 && result <= 10) {
    add_pledge(suspect)
    return { pass: true, type: 'pledge' }
  }

  if (result > 10) {
    print('SPECIAL pledge')
    add_pledge(suspect)
    add_pledge(suspect)
    return { pass: true, type: 'special' }
  }
  if (result <= 1) {
    print('NEVER pledge')
    return { pass: true, type: 'critical' }
  }
  //won't like you,
  // slander you to people close to them / who like them / they like / cohort with
  // decreases others love for player

  return { pass: false, type: 'neutral' }
}
export function jailtime_check(suspect: string, watcher: string): Consequence {
  //     wb.anti_authority > 0.3 &&
  //  ws.perception >= ss.perception &&
  // sb.passive_aggressive <= 0.0

  //testjpf GOOD time for a diceroll
  const w = npcs.all[watcher]
  const s = npcs.all[suspect]
  //so
  /**
   * what advantages do we want to give? w love? not a bin or skill
   */

  const modifier = Math.round(
    w.skills.perception - s.skills.perception + w.binaries.anti_authority * 0.5
  )
  const advantage = s.binaries.passive_aggressive < -0.1
  const result = roll_special_dice(5, advantage, 3, 2) + clamp(modifier, -3, 3)

  print('TESTJPF RESULT::: jailed', result)
  if (result > 5 && result <= 10) {
    go_to_jail(suspect)
    return { pass: true, type: 'jailed' }
  }

  if (result > 10) {
    print('SPECIAL jailed')
    return { pass: true, type: 'special' }
  }
  if (result <= 1) {
    print('NEVER jailed')
    return { pass: true, type: 'critical' }
  }
  //won't like you,
  // slander you to people close to them / who like them / they like / cohort with
  // decreases others love for player

  return { pass: false, type: 'neutral' }
}
export function snitch_check(suspect: string, watcher: string): Consequence {
  const w = npcs.all[watcher]
  const s = npcs.all[suspect]
  //so
  /**
   * what advantages do we want to give? w love? not a bin or skill
   */

  const modifier = Math.round(
    w.binaries.anti_authority * 5 +
      (w.skills.constitution - s.skills.charisma) / 2
  )
  const advantage =
    w.skills.perception + Math.abs(w.binaries.passive_aggressive * 5) >
    s.skills.stealth + +Math.abs(s.binaries.passive_aggressive * 5)
  const result = roll_special_dice(5, advantage, 3, 2) + clamp(modifier, -2, 2)

  print('TESTJPF RESULT::: snitch', result)
  if (result > 5 && result <= 10) {
    return { pass: true, type: 'snitch' }
  }

  if (result > 10) {
    print('SPECIAL snitch')
    return { pass: true, type: 'special' }
  }
  if (result <= 1) {
    print('NEVER snitch')
    return { pass: true, type: 'critical' }
  }
  //won't like you,
  // slander you to people close to them / who like them / they like / cohort with
  // decreases others love for player

  return { pass: false, type: 'neutral' }
}

//Confrontation /security
function thief_consolation_checks(n: string) {
  const tempcons: Array<(n: string) => Consequence> =
    shuffle(thief_consolations)
  tempcons.forEach((c) => {
    const consolation = c(n)
    if (consolation.pass == true) return consolation.type
  })
  print('did nothing after witnessing a theft attempt')
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
    consolation.type = thief_consolation_checks(c.npc)
    if (consolation.type != 'neutral') {
      tasks.caution_builder(
        npcs.all[c.npc],
        consolation.type,
        c.suspect,
        c.reason
      )
      c.time = 0
    } else {
      print(c.label, c.reason, 'ANY_consequence: no fx or cautions')
    }
    //} else {
    //  npcs.all[c.npc].love = npcs.all[c.npc].love - 1
    // }
  }
  return consolation.type
}
function question_consequence(c: Caution) {
  //npconly testjpf
  print('QC::: ', c.npc, 'is NOW questioning:', c.suspect)

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
    print('CAUTION:: arrest.', c.npc, 'threw', s, 'in jail')
    go_to_jail(s)
  }
}

//medics:
export function send_to_infirmary(v: string, doc: string) {
  // remove all arrests for suspect(clear record)
  print('infirmed:', v, ' :::!!!!')
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
      print(v, 'infirmed for:', npcs.all[v].cooldown)
      tasks.caution_builder(npcs.all[doc], 'mending', v, 'office')
      break
    }

    //create caution mending, reason: office
    // keep doc in aid position until caution wears off
    // if a doc isnt already in aid position.
    //patients heal faster when doc is in position.
  }
  //TESTJPF
  //ideally this would finish before stations are atempted to be filled.!!!
}
