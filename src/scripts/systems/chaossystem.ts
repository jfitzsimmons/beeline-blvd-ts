import { Consequence } from '../../types/tasks'
import { roll_special_dice } from '../utils/dice'
import { clamp, shuffle } from '../utils/utils'
import { add_prejudice } from './effectsystem'
//import { go_to_jail, add_pledge } from './emergencysystem'
import { get_extorted, remove_advantageous } from './inventorysystem'
import { go_to_jail, add_pledge } from './systemshelpers'

const { npcs, player, tasks } = globalThis.game.world

export const pos_consolations = [
  charmed_merits,
  ap_boost,
  given_gift,
  love_boost,
]
export const neg_consolations = [reckless_check, love_drop, suspicious_check]

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
/** 
function create_suspicious(suspect: string, watcher: string) {
  tasks.caution_builder(npcs.all[watcher], 'questioning', suspect, 'suspicious')
}
**/
// Misc. Checks
export function suspicious_check(
  suspect: string,
  watcher: string
): Consequence {
  const w = npcs.all[watcher]
  const s = npcs.all[suspect]

  const modifier = Math.round(
    w.skills.charisma -
      s.skills.charisma +
      w.skills.perception +
      (s.binaries.passive_aggressive + w.binaries.poor_wealthy) * 4
  )
  const advantage = w.binaries.lawless_lawful > s.binaries.lawless_lawful - 0.2
  const result = roll_special_dice(5, advantage, 3, 2) + clamp(modifier, -3, 3)
  //startherer!!!!!!!!!!!!!!!!
  print('TESTJPF RESULT suspicious:::', result)
  if (result > 5 && result <= 10) {
    // create_suspicious(suspect, watcher)
    return { pass: true, type: 'suspicious' }
  }

  if (result > 10) {
    print('SPECIAL suspicious')
    //  go_to_jail(suspect)
    return { pass: true, type: 'special' }
  }
  if (result <= 1) {
    print('NEVER suspicious')
    //shuffle(pos_consolations)[0](suspect)
    return { pass: true, type: 'critical' }
  }

  return { pass: false, type: 'neutral' }
}
function call_security(watcher: string, suspect: string) {
  npcs.all[watcher].clan == 'security'
    ? go_to_jail(suspect)
    : tasks.caution_builder(
        npcs.all[watcher],
        math.random() > 0.33 ? 'questioning' : 'arrest',
        suspect,
        'unlucky'
      )
}
//Misc. Checks
export function unlucky_check(watcher: string, suspect: string): Consequence {
  const modifier = math.random(-1, 1)
  const advantage = math.random() > 0.5
  const result = roll_special_dice(5, advantage, 3, 2) + modifier

  print('TESTJPF RESULT UNLUCKY:::', result)
  if (result > 5 && result <= 10) {
    shuffle([
      call_security,
      get_extorted,
      wPunchS,
      add_pledge,
      add_prejudice,
    ])[0](suspect, watcher)
    return { pass: true, type: 'unlucky' }
  }

  if (result > 10) {
    print('SPECIAL unlucky')
    call_security(suspect, watcher)
    return { pass: true, type: 'special' }
  }
  if (result <= 1) {
    print('NEVER unlucky')
    shuffle(pos_consolations)[0](suspect)
    return { pass: true, type: 'critical' }
  }

  return { pass: false, type: 'neutral' }
}
//Checks and Helpers
//state changes
function sPunchW(_s: string, w: string, hit = 1) {
  npcs.all[w].hp = npcs.all[w].hp - hit
}
export function wPunchS(s: string, _w: string, hit = 1) {
  npcs.all[s].hp = npcs.all[s].hp - hit
}
export function watcher_punched_check(
  suspect: string,
  watcher: string
): Consequence {
  //     p.binaries.passive_aggressive > 0.5 &&
  //p.skills.wisdom < 4 &&
  // p.skills.strength >= n.skills.speed

  //testjpf GOOD time for a diceroll
  const w = npcs.all[watcher]
  const s = npcs.all[suspect]

  const modifier = Math.round(
    s.binaries.lawless_lawful * -5 +
      s.skills.strength -
      w.skills.strength -
      w.skills.wisdom
  )
  const advantage = s.binaries.passive_aggressive * 7 > w.skills.speed
  const result = roll_special_dice(5, advantage, 3, 2) + clamp(modifier, -3, 3)

  print('TESTJPF RESULT::: s punch w', result)
  if (result > 5 && result <= 10) {
    sPunchW(suspect, watcher, 1)
    return { pass: true, type: 'sPunchW' }
  }

  if (result > 10) {
    print('SPECIAL sPunchW')
    sPunchW(suspect, watcher, 3)

    return { pass: true, type: 'special' }
  }
  if (result <= 1) {
    print('NEVER sPunchW')
    wPunchS(suspect, watcher, 2)
    return { pass: true, type: 'critical' }
  }

  return { pass: false, type: 'neutral' }
}
//testjpf needs diceroll!!
export function reckless_check(suspect: string, watcher: string): Consequence {
  //testjpf was -.5 , 4

  //   npcs.all[w].binaries.un_educated < -0.4 ||
  //  npcs.all[w].skills.intelligence < 4
  const w = npcs.all[watcher]
  const s = npcs.all[suspect]

  const modifier = Math.round(
    w.binaries.evil_good * -5 -
      w.skills.wisdom -
      s.skills.stealth +
      Math.abs(s.binaries.passive_aggressive) * 5
  )
  const advantage =
    w.skills.intelligence < 5 || w.binaries.lawless_lawful < -0.1
  const result = roll_special_dice(5, advantage, 3, 2) + clamp(modifier, -3, 3)

  print('TESTJPF RESULT::: reckless', result)
  if (result > 5 && result <= 10) {
    return { pass: true, type: 'reckless' }
  }

  if (result > 10) {
    print('SPECIAL reckless')
    return { pass: true, type: 'special' }
  }
  if (result <= 1) {
    print('NEVER reckless')
    return { pass: true, type: 'critical' }
  }

  return { pass: false, type: 'neutral' }
}
//Checks and Helpers
//misc.

export function suspect_punched_check(
  suspect: string,
  watcher: string
): Consequence {
  // ws.intelligence < 5 &&
  // wb.evil_good < -0.3 &&
  //  ws.constitution >= ss.speed

  //testjpf GOOD time for a diceroll
  const w = npcs.all[watcher]
  const s = npcs.all[suspect]

  const modifier = Math.round(
    w.skills.constitution - s.skills.speed + w.binaries.evil_good * -0.5
  )
  const advantage =
    s.binaries.passive_aggressive < w.binaries.passive_aggressive - 0.3
  const result = roll_special_dice(5, advantage, 3, 2) + clamp(modifier, -3, 3)

  print('TESTJPF RESULT::: w punch s', result)
  if (result > 5 && result <= 10) {
    wPunchS(suspect, watcher, 1)
    return { pass: true, type: 'wPunchS' }
  }

  if (result > 10) {
    print('SPECIAL wPunchS')
    wPunchS(suspect, watcher, 3)
    return { pass: true, type: 'special' }
  }
  if (result <= 1) {
    print('NEVER wPunchS')
    sPunchW(suspect, watcher, 2)
    return { pass: true, type: 'critical' }
  }

  return { pass: false, type: 'neutral' }
}
