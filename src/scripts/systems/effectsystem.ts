import { Effect, Consequence } from '../../types/tasks'
import { add_effects_bonus } from '../utils/ai'
import { fx } from '../utils/consts'
import { rollSpecialDice } from '../utils/dice'
import { clamp, shuffle } from '../utils/utils'
const { npcs, player } = globalThis.game.world

//Checks and Helpers
//effects
function add_chaotic_good(suspect: string, watcher: string) {
  if (suspect != 'player') {
    const effects_list = ['crimewave', 'inspired', 'eagleeye', 'modesty']
    const effect: Effect = fx[shuffle(effects_list)[0]]
    if (effect.fx.type == 'opinion') effect.fx.stat = npcs.all[suspect].clan
    add_effects_bonus(npcs.all[watcher], effect)
    npcs.all[watcher].effects.push(effect)
  } else {
    npcs.all[watcher].love = npcs.all[watcher].love - 2
  }
}
export function chaotic_good_check(
  suspect: string,
  watcher: string
): Consequence {
  const w = npcs.all[watcher]
  const s = suspect === 'player' ? player.state : npcs.all[suspect]
  const modifier = Math.round(w.skills.wisdom / 2 + w.binaries.evil_good * 5)
  const advantage = s.binaries.anti_authority > w.binaries.anti_authority
  const result = rollSpecialDice(5, advantage, 3, 2) + clamp(modifier, -2, 2)

  // print('TESTJPF RESULT::: chaoticgood::', result)
  if (result > 5 && result <= 10) {
    add_chaotic_good
    return { pass: true, type: 'chaoticgood' }
  }

  if (result > 10) {
    // print('SPECIAL chaoticgood')
    return { pass: true, type: 'special' }
  }
  if (result <= 1) {
    // print('NEVER chaoticgood')
    return { pass: true, type: 'critical' }
  }

  return { pass: false, type: 'neutral' }
}
function add_dumb_crook(suspect: string, watcher: string) {
  if (suspect != 'player') {
    const effects_list = ['admirer', 'opportunist', 'inspired', 'amped']
    const effect: Effect = fx[shuffle(effects_list)[0]]
    if (effect.fx.type == 'opinion') effect.fx.stat = npcs.all[suspect].clan
    add_effects_bonus(npcs.all[watcher], effect)
    npcs.all[watcher].effects.push(effect)
  } else {
    npcs.all[watcher].love = npcs.all[watcher].love + 2
  }
}
export function dumb_crook_check(
  suspect: string,
  watcher: string
): Consequence {
  const w = npcs.all[watcher]
  const s = suspect === 'player' ? player.state : npcs.all[suspect]
  const modifier = Math.round(w.binaries.lawlessLawful * -5)
  const advantage = s.binaries.un_educated * -5 > w.skills.intelligence / 2
  const result = rollSpecialDice(5, advantage, 3, 2) + clamp(modifier, -2, 2)

  // print('TESTJPF RESULT::: dumbcrook::', result)
  if (result > 5 && result <= 10) {
    add_dumb_crook
    return { pass: true, type: 'dumbcrook' }
  }

  if (result > 10) {
    // print('SPECIAL dumbcrook')
    return { pass: true, type: 'special' }
  }
  if (result <= 1) {
    // print('NEVER dumbcrook')
    return { pass: true, type: 'critical' }
  }

  return { pass: false, type: 'neutral' }
}
function add_ignorant(suspect: string, watcher: string) {
  if (suspect != 'player') {
    const effects_list = ['prejudice', 'incharge', 'boring', 'loudmouth']
    const effect: Effect = fx[shuffle(effects_list)[0]]
    if (effect.fx.type == 'opinion') effect.fx.stat = npcs.all[suspect].clan
    add_effects_bonus(npcs.all[watcher], effect)
    npcs.all[watcher].effects.push(effect)
  } else {
    npcs.all[watcher].love = npcs.all[watcher].love + 2
  }
}
export function ignorant_check(suspect: string, watcher: string): Consequence {
  const w = npcs.all[watcher]
  const s = suspect === 'player' ? player.state : npcs.all[suspect]
  const modifier = Math.round(w.binaries.un_educated * -5)
  const advantage = s.skills.intelligence > w.skills.perception
  const result = rollSpecialDice(5, advantage, 3, 2) + clamp(modifier, -2, 2)

  // print('TESTJPF RESULT::: ignorant::', result)
  if (result > 5 && result <= 10) {
    add_ignorant
    return { pass: true, type: 'ignorant' }
  }

  if (result > 10) {
    // print('SPECIAL ignorant')
    return { pass: true, type: 'special' }
  }
  if (result <= 1) {
    // print('NEVER ignorant')
    return { pass: true, type: 'critical' }
  }

  return { pass: false, type: 'neutral' }
}

function add_predator(suspect: string, watcher: string) {
  if (suspect != 'player') {
    const effects_list = ['inspired', 'opportunist', 'vanity', 'inhiding']
    const effect: Effect = fx[shuffle(effects_list)[0]]
    if (effect.fx.type == 'opinion') effect.fx.stat = npcs.all[suspect].clan
    add_effects_bonus(npcs.all[watcher], effect)
    npcs.all[watcher].effects.push(effect)
  } else {
    npcs.all[watcher].love = npcs.all[watcher].love + 2
  }
}
export function predator_check(suspect: string, watcher: string): Consequence {
  const w = npcs.all[watcher]
  const s = suspect === 'player' ? player.state : npcs.all[suspect]
  const modifier = Math.round(w.binaries.evil_good * -5)
  const advantage = s.binaries.anti_authority > w.binaries.passiveAggressive
  const result = rollSpecialDice(5, advantage, 3, 2) + clamp(modifier, -2, 2)

  // print('TESTJPF RESULT::: predator::', result)
  if (result > 5 && result <= 10) {
    add_predator
    return { pass: true, type: 'predator' }
  }

  if (result > 10) {
    // print('SPECIAL predator')
    return { pass: true, type: 'special' }
  }
  if (result <= 1) {
    // print('NEVER predator')
    return { pass: true, type: 'critical' }
  }

  return { pass: false, type: 'neutral' }
}
function add_classy(suspect: string, watcher: string) {
  if (suspect != 'player') {
    const effects_list = ['crimewave', 'inshape', 'readup', 'modesty']
    const effect: Effect = fx[shuffle(effects_list)[0]]
    if (effect.fx.type == 'opinion') effect.fx.stat = npcs.all[suspect].clan
    //tesjpf need to add to npc and player
    // already have remove
    add_effects_bonus(npcs.all[watcher], effect)
    npcs.all[watcher].effects.push(effect)
  } else {
    npcs.all[watcher].love = npcs.all[watcher].love - 2
  }
}
export function classy_check(suspect: string, watcher: string): Consequence {
  const w = npcs.all[watcher]
  const s = suspect === 'player' ? player.state : npcs.all[suspect]
  //     watcher.binaries.un_educated > 0.4 &&
  // watcher.skills.perception > 4
  const modifier = Math.round(w.binaries.un_educated * 5)
  const advantage = w.skills.perception > s.skills.strength
  const result = rollSpecialDice(5, advantage, 3, 2) + clamp(modifier, -2, 2)

  // print('TESTJPF RESULT::: classy::', result)
  if (result > 5 && result <= 10) {
    add_classy(suspect, watcher)
    return { pass: true, type: 'classy' }
  }

  if (result > 10) {
    // print('SPECIAL classy')
    return { pass: true, type: 'special' }
  }
  if (result <= 1) {
    // print('NEVER classy')
    return { pass: true, type: 'critical' }
  }

  return { pass: false, type: 'neutral' }
}
function add_angel(n: string) {
  // print('CC:: angel')
  const effect: Effect = { ...fx.angel }
  npcs.all[n].effects.push(effect) // lawfulness increase?
  add_effects_bonus(npcs.all[n], effect)
}
export function angel_check(suspect: string, watcher: string): Consequence {
  const w = npcs.all[watcher]
  const s = suspect === 'player' ? player.state : npcs.all[suspect]

  const modifier = Math.round(s.skills.wisdom - w.skills.wisdom)
  const advantage =
    Math.abs(s.binaries.evil_good) > Math.abs(w.binaries.evil_good)
  const result = rollSpecialDice(5, advantage, 3, 2) + clamp(modifier, -3, 3)

  // print('TESTJPF RESULT::: angel:', result)
  if (result > 5 && result <= 10) {
    add_angel(watcher)
    return { pass: true, type: 'angel' }
  }

  if (result > 10) {
    // print('SPECIAL angel')
    return { pass: true, type: 'special' }
  }
  if (result <= 1) {
    // print('NEVER angel')
    return { pass: true, type: 'critical' }
  }

  return { pass: false, type: 'neutral' }
}
function add_vanity(n: string) {
  // print('CC:: vanity')
  const effect: Effect = { ...fx.vanity }
  npcs.all[n].effects.push(effect) // lawfulness increase?
  add_effects_bonus(npcs.all[n], effect)
}
export function vanity_check(suspect: string, watcher: string): Consequence {
  const w = npcs.all[watcher]
  const s = suspect === 'player' ? player.state : npcs.all[suspect]
  const modifier = Math.round(
    s.skills.charisma - w.skills.intelligence + w.binaries.evil_good * -5
  )
  const advantage =
    s.skills.strength + s.binaries.un_educated * 5 >
    w.skills.strength + w.binaries.un_educated * 5
  const result = rollSpecialDice(5, advantage, 3, 2) + clamp(modifier, -3, 2)

  // print('TESTJPF RESULT::: vanity', result)
  if (result > 5 && result <= 10) {
    add_vanity(watcher)
    return { pass: true, type: 'vanity' }
  }

  if (result > 10) {
    // print('SPECIAL VANITY')
    return { pass: true, type: 'special' }
  }
  if (result <= 1) {
    // print('NEVER VANITY')
    return { pass: true, type: 'critical' }
  }

  return { pass: false, type: 'neutral' }
}
function add_admirer(s: string, w: string) {
  const effect: Effect = { ...fx.admirer }
  effect.fx.stat = npcs.all[s].clan
  npcs.all[w].effects.push(effect)
  add_effects_bonus(npcs.all[w], effect)
}
export function admirer_check(suspect: string, watcher: string): Consequence {
  const w = npcs.all[watcher]
  const s = suspect === 'player' ? player.state : npcs.all[suspect]
  const modifier = Math.round(
    s.skills.charisma - w.skills.charisma + w.binaries.anti_authority * -5
  )
  const advantage =
    s.skills.intelligence > w.skills.perception && w.skills.strength < 5
  const result = rollSpecialDice(5, advantage, 3, 2) + clamp(modifier, -3, 3)

  // print('TESTJPF RESULT::: admirer', result)
  if (result > 5 && result <= 10) {
    add_admirer(suspect, watcher)
    return { pass: true, type: 'admirer' }
  }

  if (result > 10) {
    // print('SPECIAL ADMIRERER')
    return { pass: true, type: 'special' }
  }
  if (result <= 1) {
    // print('NEVER ADMIRERER')
    return { pass: true, type: 'critical' }
  }

  return { pass: false, type: 'neutral' }
}
export function add_prejudice(s: string, w: string) {
  // print('QC:: prejudice')
  const effect: Effect = { ...fx.prejudice }
  effect.fx.stat = npcs.all[s].clan
  npcs.all[w].effects.push(effect)
  add_effects_bonus(npcs.all[w], effect)
}
export function prejudice_check(suspect: string, watcher: string): Consequence {
  const w = npcs.all[watcher]
  const s = suspect === 'player' ? player.state : npcs.all[suspect]
  const modifier = Math.round(
    w.binaries.poor_wealthy * -5 + s.binaries.poor_wealthy * -5
  )
  const advantage = w.skills.wisdom + w.skills.charisma < w.skills.stealth / 2
  const result = rollSpecialDice(5, advantage, 3, 2) + clamp(modifier, -3, 3)

  // print('TESTJPF RESULT::: prejudice', result)
  if (result > 5 && result <= 10) {
    add_prejudice(suspect, watcher)
    return { pass: true, type: 'prejudice' }
  }

  if (result > 10) {
    // print('SPECIAL prejudice')
    return { pass: true, type: 'special' }
  }
  if (result <= 1) {
    // print('NEVER prejudice')
    return { pass: true, type: 'critical' }
  }

  return { pass: false, type: 'neutral' }
}

//TESTJPF ADD TO PLAYER AND NPC TODO

/**  moved to npc state
 * 
 * export function remove_effects_bonus(a: NpcState, e: Effect) {
  a[e.fx.type][e.fx.stat] = a[e.fx.type][e.fx.stat] - e.fx.adjustment
}

export function remove_effects(a: NpcState) {
  if (a.effects.length > 0) {
    //let eKey: keyof typeof
    for (const effect of a.effects) {
      if (effect.turns < 0) {
        remove_effects_bonus(a, effect)

        a.effects.splice(a.effects.indexOf(effect), 1)
      } else {
        effect.turns = effect.turns - 1
      }
    }
  }
}
*/
