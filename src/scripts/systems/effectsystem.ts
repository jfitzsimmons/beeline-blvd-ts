import { Effect, Consequence } from '../../types/tasks'
import { fx } from '../utils/consts'
import { rollSpecialDice } from '../utils/dice'
import { clamp, shuffle } from '../utils/utils'
const { npcs, player } = globalThis.game.world

function add_predator(suspect: string, watcher: string) {
  if (suspect != 'player') {
    const effects_list = ['inspired', 'opportunist', 'vanity', 'inhiding']
    const effect: Effect = fx[shuffle(effects_list)[0]]
    if (effect.fx.type == 'opinion') effect.fx.stat = npcs.all[suspect].clan
    npcs.all[watcher].add_effects_bonus(effect)
    npcs.all[watcher].effects.push(effect)
  } else {
    npcs.all[watcher].love = npcs.all[watcher].love + 2
  }
}
export function predator_check(suspect: string, watcher: string): Consequence {
  const w = npcs.all[watcher]
  const s = suspect === 'player' ? player.state : npcs.all[suspect]
  const modifier = Math.round(w.traits.binaries.evil_good * -5)
  const advantage =
    s.traits.binaries.anti_authority > w.traits.binaries.passiveAggressive
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
    npcs.all[watcher].add_effects_bonus(effect)
    npcs.all[watcher].effects.push(effect)
  } else {
    npcs.all[watcher].love = npcs.all[watcher].love - 2
  }
}
export function classy_check(suspect: string, watcher: string): Consequence {
  const w = npcs.all[watcher]
  const s = suspect === 'player' ? player.state : npcs.all[suspect]
  //     watcher.traits.binaries.un_educated > 0.4 &&
  // watcher.traits.skills.perception > 4
  const modifier = Math.round(w.traits.binaries.un_educated * 5)
  const advantage = w.traits.skills.perception > s.traits.skills.strength
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
  npcs.all[n].add_effects_bonus(effect)
}
export function angel_check(suspect: string, watcher: string): Consequence {
  const w = npcs.all[watcher]
  const s = suspect === 'player' ? player.state : npcs.all[suspect]

  const modifier = Math.round(s.traits.skills.wisdom - w.traits.skills.wisdom)
  const advantage =
    Math.abs(s.traits.binaries.evil_good) >
    Math.abs(w.traits.binaries.evil_good)
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
  npcs.all[n].add_effects_bonus(effect)
}
export function vanity_check(suspect: string, watcher: string): Consequence {
  const w = npcs.all[watcher]
  const s = suspect === 'player' ? player.state : npcs.all[suspect]
  const modifier = Math.round(
    s.traits.skills.charisma -
      w.traits.skills.intelligence +
      w.traits.binaries.evil_good * -5
  )
  const advantage =
    s.traits.skills.strength + s.traits.binaries.un_educated * 5 >
    w.traits.skills.strength + w.traits.binaries.un_educated * 5
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
  npcs.all[w].add_effects_bonus(effect)
}
export function admirer_check(suspect: string, watcher: string): Consequence {
  const w = npcs.all[watcher]
  const s = suspect === 'player' ? player.state : npcs.all[suspect]
  const modifier = Math.round(
    s.traits.skills.charisma -
      w.traits.skills.charisma +
      w.traits.binaries.anti_authority * -5
  )
  const advantage =
    s.traits.skills.intelligence > w.traits.skills.perception &&
    w.traits.skills.strength < 5
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
  npcs.all[w].add_effects_bonus(effect)
}
export function prejudice_check(suspect: string, watcher: string): Consequence {
  const w = npcs.all[watcher]
  const s = suspect === 'player' ? player.state : npcs.all[suspect]
  const modifier = Math.round(
    w.traits.binaries.poor_wealthy * -5 + s.traits.binaries.poor_wealthy * -5
  )
  const advantage =
    w.traits.skills.wisdom + w.traits.skills.charisma <
    w.traits.skills.stealth / 2
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
