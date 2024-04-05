import { Consequence, Effect, Npc } from '../../types/state'
import { roll_special_dice } from '../utils/dice'
import { clamp, shuffle } from '../utils/utils'
const { npcs } = globalThis.game.world

//Checks and Helpers
//effects
function add_chaotic_good(suspect: string, watcher: string) {
  if (suspect != 'player') {
    const effects_list = ['crimewave', 'inspired', 'eagleeye', 'modesty']
    const effect: Effect = fx[shuffle(effects_list)[0]]
    if (effect.fx.type == 'attitudes') effect.fx.stat = npcs.all[suspect].clan
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
  const s = npcs.all[suspect]
  // watcher.binaries.evil_good > 0.5 &&
  //watcher.skills.wisdom > 5
  const modifier = Math.round(w.skills.wisdom / 2 + w.binaries.evil_good * 5)
  const advantage = s.binaries.anti_authority > w.binaries.anti_authority
  const result = roll_special_dice(5, advantage, 3, 2) + clamp(modifier, -2, 2)

  print('TESTJPF RESULT::: chaoticgood::', result)
  if (result > 5 && result <= 10) {
    add_chaotic_good
    return { pass: true, type: 'chaoticgood' }
  }

  if (result > 10) {
    print('SPECIAL chaoticgood')
    return { pass: true, type: 'special' }
  }
  if (result <= 1) {
    print('NEVER chaoticgood')
    return { pass: true, type: 'critical' }
  }

  return { pass: false, type: 'neutral' }
}
function add_dumb_crook(suspect: string, watcher: string) {
  if (suspect != 'player') {
    const effects_list = ['admirer', 'opportunist', 'inspired', 'amped']
    const effect: Effect = fx[shuffle(effects_list)[0]]
    if (effect.fx.type == 'attitudes') effect.fx.stat = npcs.all[suspect].clan
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
  const s = npcs.all[suspect]
  //   watcher.binaries.lawless_lawful < -0.5 &&
  // watcher.skills.intelligence < 4
  const modifier = Math.round(w.binaries.lawless_lawful * -5)
  const advantage = s.binaries.un_educated * -5 > w.skills.intelligence / 2
  const result = roll_special_dice(5, advantage, 3, 2) + clamp(modifier, -2, 2)

  print('TESTJPF RESULT::: dumbcrook::', result)
  if (result > 5 && result <= 10) {
    add_dumb_crook
    return { pass: true, type: 'dumbcrook' }
  }

  if (result > 10) {
    print('SPECIAL dumbcrook')
    return { pass: true, type: 'special' }
  }
  if (result <= 1) {
    print('NEVER dumbcrook')
    return { pass: true, type: 'critical' }
  }

  return { pass: false, type: 'neutral' }
}
function add_ignorant(suspect: string, watcher: string) {
  if (suspect != 'player') {
    const effects_list = ['prejudice', 'incharge', 'boring', 'loudmouth']
    const effect: Effect = fx[shuffle(effects_list)[0]]
    if (effect.fx.type == 'attitudes') effect.fx.stat = npcs.all[suspect].clan
    add_effects_bonus(npcs.all[watcher], effect)
    npcs.all[watcher].effects.push(effect)
  } else {
    npcs.all[watcher].love = npcs.all[watcher].love + 2
  }
}
export function ignorant_check(suspect: string, watcher: string): Consequence {
  const w = npcs.all[watcher]
  const s = npcs.all[suspect]
  //    watcher.binaries.un_educated < -0.5 &&
  //watcher.skills.perception < 4

  const modifier = Math.round(w.binaries.un_educated * -5)
  const advantage = s.skills.intelligence > w.skills.perception
  const result = roll_special_dice(5, advantage, 3, 2) + clamp(modifier, -2, 2)

  print('TESTJPF RESULT::: ignorant::', result)
  if (result > 5 && result <= 10) {
    add_ignorant
    return { pass: true, type: 'ignorant' }
  }

  if (result > 10) {
    print('SPECIAL ignorant')
    return { pass: true, type: 'special' }
  }
  if (result <= 1) {
    print('NEVER ignorant')
    return { pass: true, type: 'critical' }
  }

  return { pass: false, type: 'neutral' }
}

function add_predator(suspect: string, watcher: string) {
  if (suspect != 'player') {
    const effects_list = ['inspired', 'opportunist', 'vanity', 'inhiding']
    const effect: Effect = fx[shuffle(effects_list)[0]]
    if (effect.fx.type == 'attitudes') effect.fx.stat = npcs.all[suspect].clan
    add_effects_bonus(npcs.all[watcher], effect)
    npcs.all[watcher].effects.push(effect)
  } else {
    npcs.all[watcher].love = npcs.all[watcher].love + 2
  }
}
export function predator_check(suspect: string, watcher: string): Consequence {
  const w = npcs.all[watcher]
  const s = npcs.all[suspect]
  //    watcher.binaries.evil_good < -0.6 &&
  // watcher.binaries.passive_aggressive > 0.6
  const modifier = Math.round(w.binaries.evil_good * -5)
  const advantage = s.binaries.anti_authority > w.binaries.passive_aggressive
  const result = roll_special_dice(5, advantage, 3, 2) + clamp(modifier, -2, 2)

  print('TESTJPF RESULT::: predator::', result)
  if (result > 5 && result <= 10) {
    add_predator
    return { pass: true, type: 'predator' }
  }

  if (result > 10) {
    print('SPECIAL predator')
    return { pass: true, type: 'special' }
  }
  if (result <= 1) {
    print('NEVER predator')
    return { pass: true, type: 'critical' }
  }

  return { pass: false, type: 'neutral' }
}
function add_classy(suspect: string, watcher: string) {
  if (suspect != 'player') {
    const effects_list = ['crimewave', 'inshape', 'readup', 'modesty']
    const effect: Effect = fx[shuffle(effects_list)[0]]
    if (effect.fx.type == 'attitudes') effect.fx.stat = npcs.all[suspect].clan
    add_effects_bonus(npcs.all[watcher], effect)
    npcs.all[watcher].effects.push(effect)
  } else {
    npcs.all[watcher].love = npcs.all[watcher].love - 2
  }
}
export function classy_check(suspect: string, watcher: string): Consequence {
  const w = npcs.all[watcher]
  const s = npcs.all[suspect]
  //     watcher.binaries.un_educated > 0.4 &&
  // watcher.skills.perception > 4
  const modifier = Math.round(w.binaries.un_educated * 5)
  const advantage = w.skills.perception > s.skills.strength
  const result = roll_special_dice(5, advantage, 3, 2) + clamp(modifier, -2, 2)

  print('TESTJPF RESULT::: classy::', result)
  if (result > 5 && result <= 10) {
    add_classy
    return { pass: true, type: 'classy' }
  }

  if (result > 10) {
    print('SPECIAL classy')
    return { pass: true, type: 'special' }
  }
  if (result <= 1) {
    print('NEVER classy')
    return { pass: true, type: 'critical' }
  }

  return { pass: false, type: 'neutral' }
}
function add_angel(n: string) {
  print('CC:: angel')
  const effect: Effect = { ...fx.angel }
  npcs.all[n].effects.push(effect) // lawfulness increase?
  add_effects_bonus(npcs.all[n], effect)
}
export function angel_check(suspect: string, watcher: string): Consequence {
  //     p.skills.wisdom > 6 &&
  //n.skills.wisdom > 5 &&
  //p.binaries.evil_good + n.binaries.evil_good > 0.3

  //testjpf GOOD time for a diceroll
  const w = npcs.all[watcher]
  const s = npcs.all[suspect]

  const modifier = Math.round(s.skills.wisdom - w.skills.wisdom)
  const advantage =
    Math.abs(s.binaries.evil_good) > Math.abs(w.binaries.evil_good)
  const result = roll_special_dice(5, advantage, 3, 2) + clamp(modifier, -3, 3)

  print('TESTJPF RESULT::: angel:', result)
  if (result > 5 && result <= 10) {
    add_angel(watcher)
    return { pass: true, type: 'angel' }
  }

  if (result > 10) {
    print('SPECIAL angel')
    return { pass: true, type: 'special' }
  }
  if (result <= 1) {
    print('NEVER angel')
    return { pass: true, type: 'critical' }
  }

  return { pass: false, type: 'neutral' }
}
function add_vanity(n: string) {
  print('CC:: vanity')
  const effect: Effect = { ...fx.vanity }
  npcs.all[n].effects.push(effect) // lawfulness increase?
  add_effects_bonus(npcs.all[n], effect)
}
export function vanity_check(suspect: string, watcher: string): Consequence {
  //     p.skills.charisma > 5 &&
  // n.skills.intelligence < 5 &&
  // p.binaries.evil_good < -0.2

  //testjpf GOOD time for a diceroll
  const w = npcs.all[watcher]
  const s = npcs.all[suspect]
  //so
  /**
   * what advantages do we want to give? w love? not a bin or skill

   */

  const modifier = Math.round(
    s.skills.charisma - w.skills.intelligence + w.binaries.evil_good * -5
  )
  const advantage =
    s.skills.strength + s.binaries.un_educated * 5 >
    w.skills.strength + w.binaries.un_educated * 5
  const result = roll_special_dice(5, advantage, 3, 2) + clamp(modifier, -3, 2)

  print('TESTJPF RESULT::: vanity', result)
  if (result > 5 && result <= 10) {
    add_vanity(watcher)
    return { pass: true, type: 'vanity' }
  }

  if (result > 10) {
    print('SPECIAL VANITY')
    return { pass: true, type: 'special' }
  }
  if (result <= 1) {
    print('NEVER VANITY')
    return { pass: true, type: 'critical' }
  }
  //won't like you,
  // slander you to people close to them / who like them / they like / cohort with
  // decreases others love for player

  return { pass: false, type: 'neutral' }
}
function add_admirer(s: string, w: string) {
  const effect: Effect = { ...fx.admirer }
  effect.fx.stat = npcs.all[s].clan
  npcs.all[w].effects.push(effect)
  add_effects_bonus(npcs.all[w], effect)
}
export function admirer_check(suspect: string, watcher: string): Consequence {
  // ws.charisma <= ss.charisma &&
  // wb.anti_authority < -0.3 &&
  // ws.perception < 5

  //testjpf GOOD time for a diceroll
  const w = npcs.all[watcher]
  const s = npcs.all[suspect]
  //so
  /**
   * what advantages do we want to give? w love? not a bin or skill

   */

  const modifier = Math.round(
    s.skills.charisma - w.skills.charisma + w.binaries.anti_authority * -5
  )
  const advantage =
    s.skills.intelligence > w.skills.perception && w.skills.strength < 5
  const result = roll_special_dice(5, advantage, 3, 2) + clamp(modifier, -3, 3)

  print('TESTJPF RESULT::: admirer', result)
  if (result > 5 && result <= 10) {
    add_admirer(suspect, watcher)
    return { pass: true, type: 'admirer' }
  }

  if (result > 10) {
    print('SPECIAL ADMIRERER')
    return { pass: true, type: 'special' }
  }
  if (result <= 1) {
    print('NEVER ADMIRERER')
    return { pass: true, type: 'critical' }
  }
  //won't like you,
  // slander you to people close to them / who like them / they like / cohort with
  // decreases others love for player

  return { pass: false, type: 'neutral' }
}
export function add_prejudice(s: string, w: string) {
  print('QC:: prejudice')
  const effect: Effect = { ...fx.prejudice }
  effect.fx.stat = npcs.all[s].clan
  npcs.all[w].effects.push(effect)
  add_effects_bonus(npcs.all[w], effect)
}
export function prejudice_check(suspect: string, watcher: string): Consequence {
  //     ws.wisdom < 4 &&
  //  sb.poor_wealthy < wb.poor_wealthy &&
  //  ws.charisma < ws.stealth

  //testjpf GOOD time for a diceroll
  const w = npcs.all[watcher]
  const s = npcs.all[suspect]
  //so
  /**
   * what advantages do we want to give? w love? not a bin or skill

   */

  const modifier = Math.round(
    w.binaries.poor_wealthy * -5 + s.binaries.poor_wealthy * -5
  )
  const advantage = w.skills.wisdom + w.skills.charisma < w.skills.stealth / 2
  const result = roll_special_dice(5, advantage, 3, 2) + clamp(modifier, -3, 3)

  print('TESTJPF RESULT::: prejudice', result)
  if (result > 5 && result <= 10) {
    add_prejudice(suspect, watcher)
    return { pass: true, type: 'prejudice' }
  }

  if (result > 10) {
    print('SPECIAL prejudice')
    return { pass: true, type: 'special' }
  }
  if (result <= 1) {
    print('NEVER prejudice')
    return { pass: true, type: 'critical' }
  }
  //won't like you,
  // slander you to people close to them / who like them / they like / cohort with
  // decreases others love for player

  return { pass: false, type: 'neutral' }
}

export const fx: { [key: string]: Effect } = {
  crimewave: {
    label: 'crimewave',
    turns: 10,
    fx: {
      type: 'binaries',
      stat: 'lawless_lawful',
      adjustment: 0.2,
    },
  },
  yogi: {
    label: 'yogi',
    turns: 10,
    fx: {
      type: 'skills',
      stat: 'wisdom',
      adjustment: 2,
    },
  },
  angel: {
    label: 'angel',
    turns: 10,
    fx: {
      type: 'binaries',
      stat: 'evil_good',
      adjustment: 0.2,
    },
  },
  devil: {
    label: 'devil',
    turns: 10,
    fx: {
      type: 'binaries',
      stat: 'evil_good',
      adjustment: -0.2,
    },
  },
  inspired: {
    label: 'inspired',
    turns: 10,
    fx: {
      type: 'skills',
      stat: 'constitution',
      adjustment: 2,
    },
  },
  eagleeye: {
    label: 'eagleeye',
    turns: 10,
    fx: {
      type: 'skills',
      stat: 'perception',
      adjustment: 2,
    },
  },
  modesty: {
    label: 'modesty',
    turns: 10,
    fx: {
      type: 'binaries',
      stat: 'poor_wealthy',
      adjustment: -0.2,
    },
  },
  admirer: {
    label: 'admirer',
    turns: 10,
    fx: {
      type: 'attitudes',
      stat: '',
      adjustment: 3,
    },
  },
  opportunist: {
    label: 'opportunist',
    turns: 10,
    fx: {
      type: 'binaries',
      stat: 'lawless_lawful',
      adjustment: -0.2,
    },
  },
  amped: {
    label: 'amped',
    turns: 10,
    fx: {
      type: 'binaries',
      stat: 'passive_aggressive',
      adjustment: 0.2,
    },
  },
  prejudice: {
    label: 'prejudice',
    turns: 10,
    fx: {
      type: 'attitudes',
      stat: '',
      adjustment: -3,
    },
  },
  incharge: {
    label: 'incharge',
    turns: 10,
    fx: {
      type: 'binaries',
      stat: 'anti_authority',
      adjustment: 0.2,
    },
  },
  boring: {
    label: 'boring',
    turns: 10,
    fx: {
      type: 'skills',
      stat: 'charisma',
      adjustment: -2,
    },
  },
  loudmouth: {
    label: 'loudmouth',
    turns: 10,
    fx: {
      type: 'skills',
      stat: 'stealth',
      adjustment: -2,
    },
  },
  vanity: {
    label: 'vanity',
    turns: 10,
    fx: {
      type: 'skills',
      stat: 'charisma',
      adjustment: 2,
    },
  },
  inhiding: {
    label: 'inhiding',
    turns: 10,
    fx: {
      type: 'skills',
      stat: 'stealth',
      adjustment: 2,
    },
  },
  inshape: {
    label: 'inshape',
    turns: 10,
    fx: {
      type: 'skills',
      stat: 'strength',
      adjustment: 2,
    },
  },
  readup: {
    label: 'readup',
    turns: 10,
    fx: {
      type: 'skills',
      stat: 'intelligence',
      adjustment: 2,
    },
  },
  dunce: {
    label: 'dunce',
    turns: 10,
    fx: {
      type: 'skills',
      stat: 'intelligence',
      adjustment: -2,
    },
  },
  lazy: {
    label: 'lazy',
    turns: 10,
    fx: {
      type: 'skills',
      stat: 'constitution',
      adjustment: -2,
    },
  },
  ignorant: {
    label: 'ignorant',
    turns: 10,
    fx: {
      type: 'skills',
      stat: 'wisdom',
      adjustment: -2,
    },
  },
  distracted: {
    label: 'distracted',
    turns: 10,
    fx: {
      type: 'skills',
      stat: 'perception',
      adjustment: -2,
    },
  },
}

export function remove_effects_bonus(a: Npc, e: Effect) {
  a[e.fx.type][e.fx.stat] = a[e.fx.type][e.fx.stat] - e.fx.adjustment
}

export function add_effects_bonus(a: Npc, e: Effect) {
  print(
    'add_effects_bonus',
    a.labelname,
    'type:',
    e.fx.type,
    'stat:',
    e.fx.stat
  )
  a[e.fx.type][e.fx.stat] = a[e.fx.type][e.fx.stat] + e.fx.adjustment
}

export function remove_effects(a: Npc) {
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
