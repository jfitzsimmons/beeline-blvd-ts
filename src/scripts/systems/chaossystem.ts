import { Consequence } from '../../types/state'
import { roll_special_dice } from '../utils/dice'
import { clamp, shuffle } from '../utils/utils'
import { add_prejudice } from './effectsystem'
//import { go_to_jail, add_pledge } from './emergencysystem'
import { get_extorted } from './inventorysystem'
import { go_to_jail, add_pledge } from './systemshelpers'

const { npcs } = globalThis.game.world

//Misc. Checks
export function unlucky_check(suspect: string, watcher: string): Consequence {
  //     wb.anti_authority > 0.3 &&
  //  ws.perception >= ss.perception &&
  // sb.passive_aggressive <= 0.0

  //testjpf GOOD time for a diceroll
  //const w = npcs.all[watcher]
  //const s = npcs.all[suspect]
  //so
  /**
   * what advantages do we want to give? w love? not a bin or skill
   */

  const modifier = math.random(-1, 1)
  const advantage = math.random() > 0.5
  const result = roll_special_dice(5, advantage, 3, 2) + modifier

  print('TESTJPF RESULT UNLUCKY:::', result)
  if (result > 5 && result <= 10) {
    shuffle([go_to_jail, get_extorted, wPunchS, add_pledge, add_prejudice])[0](
      suspect,
      watcher
    )
    return { pass: true, type: 'unlucky' }
  }

  if (result > 10) {
    print('SPECIAL unlucky')
    shuffle([go_to_jail, get_extorted, wPunchS, add_pledge, add_prejudice])[0](
      suspect,
      watcher
    )
    return { pass: true, type: 'special' }
  }
  if (result <= 1) {
    print('NEVER unlucky')
    return { pass: true, type: 'critical' }
  }
  //won't like you,
  // slander you to people close to them / who like them / they like / cohort with
  // decreases others love for player

  return { pass: false, type: 'neutral' }
}
//Checks and Helpers
//state changes
function sPunchW(w: string) {
  npcs.all[w].hp = npcs.all[w].hp - 1
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
  //so
  /**
   * what advantages do we want to give? w love? not a bin or skill
   */

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
    sPunchW(watcher)
    return { pass: true, type: 'sPunchW' }
  }

  if (result > 10) {
    print('SPECIAL sPunchW')
    return { pass: true, type: 'special' }
  }
  if (result <= 1) {
    print('NEVER sPunchW')
    return { pass: true, type: 'critical' }
  }
  //won't like you,
  // slander you to people close to them / who like them / they like / cohort with
  // decreases others love for player

  return { pass: false, type: 'neutral' }
}
export function wPunchS(s: string) {
  npcs.all[s].hp = npcs.all[s].hp - 1
}
export function reckless(n: string): Consequence {
  //testjpf was -.5 , 4
  if (
    npcs.all[n].binaries.un_educated < -0.4 ||
    npcs.all[n].skills.intelligence < 4
  ) {
    //underdog task
    return { pass: true, type: 'reckless' }
  }
  // will tell whoever what they saw
  // they might like it or hate it

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
  //so
  /**
   * what advantages do we want to give? w love? not a bin or skill
   */

  const modifier = Math.round(
    w.skills.constitution - s.skills.speed + w.binaries.evil_good * -0.5
  )
  const advantage =
    s.binaries.passive_aggressive < w.binaries.passive_aggressive - 0.3
  const result = roll_special_dice(5, advantage, 3, 2) + clamp(modifier, -3, 3)

  print('TESTJPF RESULT::: w punch s', result)
  if (result > 5 && result <= 10) {
    wPunchS(suspect)
    return { pass: true, type: 'wPunchS' }
  }

  if (result > 10) {
    print('SPECIAL wPunchS')
    return { pass: true, type: 'special' }
  }
  if (result <= 1) {
    print('NEVER wPunchS')
    return { pass: true, type: 'critical' }
  }
  //won't like you,
  // slander you to people close to them / who like them / they like / cohort with
  // decreases others love for player

  return { pass: false, type: 'neutral' }
}
