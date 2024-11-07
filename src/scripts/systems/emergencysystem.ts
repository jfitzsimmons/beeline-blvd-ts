//import { Occupants } from '../../types/state'
import { rollSpecialDice } from '../utils/dice'
import {
  //arraymove,
  clamp,
  shuffle,
} from '../utils/utils'
import { admirer_check, prejudice_check } from './effectsystem'
import { bribe_check } from './inventorysystem'
import {
  recklessCheck,
  suspect_punched_check,
  unlucky_check,
} from './chaossystem'
import { add_pledge, go_to_jail } from './systemshelpers'
import { Task, Consequence } from '../../types/tasks'

const { tasks, npcs, player } = globalThis.game.world
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
  meritsDemerits,
  recklessCheck,
  //society_check,
]
//Crime Consolations

//export const injured_npcs: string[] = []

function meritsDemerits(suspect: string, watcher: string): Consequence {
  const w = npcs.all[watcher]
  const s = suspect === 'player' ? player.state : npcs.all[suspect]

  const modifier = Math.round(
    (w.traits.binaries.evil_good + w.traits.binaries.lawlessLawful) * -2.5
  )
  const advantage =
    w.traits.skills.constitution +
      (w.traits.binaries.passiveAggressive - s.traits.binaries.evil_good) * 5 >
    7.5
  const result = rollSpecialDice(6, advantage, 3, 2) + clamp(modifier, -1, 1)
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
    w.traits.binaries.passiveAggressive * -5 +
      s.traits.binaries.passiveAggressive * 5
  )
  const advantage = w.traits.skills.wisdom > s.traits.skills.constitution + 1
  const result = rollSpecialDice(5, advantage, 3, 2) + clamp(modifier, -3, 3)

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
    w.traits.skills.perception -
      s.traits.skills.perception +
      w.traits.binaries.anti_authority * 4
  )
  const advantage = s.traits.binaries.passiveAggressive < 0.2
  const result = rollSpecialDice(5, advantage, 3, 2) + clamp(modifier, -3, 3)

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
    w.traits.binaries.anti_authority * 5 +
      (w.traits.skills.constitution - s.traits.skills.charisma) / 2
  )
  const advantage =
    w.traits.skills.perception +
      Math.abs(w.traits.binaries.passiveAggressive * 5) >
    s.traits.skills.stealth + +Math.abs(s.traits.binaries.passiveAggressive * 5)
  const result = rollSpecialDice(5, advantage, 3, 2) + clamp(modifier, -2, 2)

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

  for (const check of tempcons) {
    const consolation = check(s, w)
    if (consolation.pass == true) {
      print('EMsys::: thief_consolation_checks::', consolation.type)
      return consolation.type
    }
  }
  print('did nothing after witnessing a theft attempt')
  return 'neutral'
}
export function build_consequence(
  c: Task,
  checks: Array<(n: string, w: string) => Consequence>,
  precheck = false
) {
  let consolation = { pass: precheck, type: 'neutral' }

  for (let i = checks.length; i-- !== 0; ) {
    consolation = checks[i](c.target, c.owner)
    if (consolation.pass == true) break
  }

  if (consolation.pass == false) {
    //if (c.target != 'player') {
    consolation.type = thief_consolation_checks(c.target, c.owner)
    if (consolation.type != 'neutral') {
      //this will probably be new tasks()
      tasks.taskBuilder(c.owner, consolation.type, c.target, c.cause)
      c.turns = 0
    } else {
      //print(c.label, c.cause, 'ANY_consequence: no fx or cautions')
    }
    //} else {
    //  npcs.all[c.owner].love = npcs.all[c.owner].love - 1
    // }
  }
  //print('BUILD CONEQUENCE return type::', consolation.type)
  return consolation.type
}
function question_consequence(c: Task) {
  //npconly
  //print('QC::: ', c.owner, 'is NOW questioning:', c.target)

  const tempcons: Array<
    (s: string, w: string) => { pass: boolean; type: string }
  > = shuffle(questioning_checks)

  build_consequence(c, tempcons)
  c.turns = 0
}
export function npc_confrontation(s: string, c: Task) {
  if (c.label == 'questioning') {
    question_consequence(c)
  } else if (c.label == 'arrest') {
    //print('CAUTION:: arrest.', c.owner, 'threw', s, 'in jail')
    go_to_jail(s)
  }
}

//medics:
/** 
export function sendToInfirmary(v: string, doc: string) {
  tasks.removeHeat(v)
  tasks.remove_mend(v)
  const occupants: Occupants = rooms.all.infirmary.occupants!
  let station: keyof typeof occupants
  for (station in occupants) {
    const patient = occupants[station]
    if (patient == '') {
      // rooms.all.infirmary.occupants![station] = v
      // npcs.all[v].matrix = rooms.all.infirmary.matrix
      // npcs.all[v].cooldown = 8
      //  npcs.all[v].currRoom = 'infirmary'
      //  npcs.all[v].currStation = station
      //print(v, 'infirmed for:', npcs.all[v].cooldown)

      //TESTJPF::::
      // handled on doc turn state, or maybe a new FSM respond state
      // tasks.taskBuilder(npcs.all[doc], 'mending', v, 'office')
      break
    }
  }
}*/

//export function freeze_injured_npc(npc: NpcState) {
//reset npc into current position
// now testjpf func to npcstatemachine
// pass rooms all to npc class
// change npc state to injury!!
//rooms.all[npc.currRoom].stations[npc.currStation] = npc.name
//check if and where injured is located in Doctors' queue
//mending should be a state. q moved to NpcStates
//,move to npc add responder state
//TESTJPF TODO NOW //needs to be movedto npc mending state
//const limit = tasks.mendingQueue.indexOf(npc.name)
//if npc isn't in q, put them on all NPC's radar for caution creation
//instead us harmed state
/** 
  if (limit < 0 && injured_npcs.includes(npc.name) == false) {
    injured_npcs.push(npc.name)
  } else if (limit > 3) {
    //if npc isn't in q, put them on Doctors' radar
    //(tasks.mendingQueue, limit, 0)
  }*/
//}
/** 
export function doctor_ai_turn(
  npc: NpcState
  //targets: Direction
): [Direction, boolean] {
  const patients = Object.values(rooms.all.infirmary.occupants!).filter(
    (p) => p != ''
  )
  //let docInOffice = false
  let t: Direction = {}
  // does doctor have a field caution?
  if (patients.length > 1 && math.random() + patients.length * 0.1 > 0.6) {
    //RNG weighted by num of patients. Sends doc to infirmary.
    rooms.all.infirmary.stations.aid = npc.name
    // docInOffice = true
  } else if (patients.length > 3) {
    //Force Doc to infirmary if overwhelmed
    t = surrounding_room_matrix(rooms.all.infirmary.matrix, npc.matrix)
  } else if (tasks.mendingQueue.length > 0) {
    //find priority emergency patient
    t = surrounding_room_matrix(
      rooms.all[npcs.all[tasks.mendingQueue[0]].currRoom].matrix,
      npc.matrix
    )
  }

  return t
}
*/
