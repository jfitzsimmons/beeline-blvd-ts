import { Consequence, Npc, PlayerState, Skills } from '../../types/state'
import { roll_special_dice } from '../utils/dice'
import { clamp, shuffle } from '../utils/utils'
const { npcs } = globalThis.game.world

interface InventoryTable {
  [key: string]: InventoryTableItem
}
interface InventoryTableItem {
  value: number
  level: number
  binaries: { [key: string]: number }
  skills: { [key: string]: number }
}
export const items: InventoryTable = {
  magica1: {
    value: 2,
    level: 1,
    binaries: {
      anti_authority: -0.1,
      evil_good: 0.1,
    },
    skills: {},
  },
  feather01: {
    value: 1,
    level: 1,
    binaries: {
      anti_authority: -0.1,
    },
    skills: {
      speed: 1,
    },
  },
  berry01: {
    value: 2,
    level: 1,
    binaries: {
      anti_authority: 0.1,
    },
    skills: {
      wisdom: -1,
    },
  },
  drumstick01: {
    value: 3,
    level: 1,
    binaries: {
      anti_authority: -0.2,
    },
    skills: {
      speed: -2,
    },
  },
  magica4: {
    value: 4,
    level: 1,
    binaries: {
      evil_good: 0.3,
    },
    skills: {},
  },
  magicb3: {
    value: 4,
    level: 1,
    binaries: {
      evil_good: -0.3,
    },
    skills: {},
  },
  magicb1: {
    value: 3,
    level: 1,
    binaries: {
      evil_good: -0.1,
    },
    skills: {},
  },
  feather02: {
    value: 2,
    level: 1,
    binaries: {
      anti_authority: -0.1,
    },
    skills: {},
  },
  eyeball02: {
    value: 2,
    level: 1,
    binaries: {
      lawless_lawful: -0.2,
    },
    skills: {},
  },
  eyeball03: {
    value: 3,
    level: 1,
    binaries: {
      lawless_lawful: -0.3,
    },
    skills: {
      perception: 1,
    },
  },
  sunhat: {
    value: 3,
    level: 1,
    binaries: {
      passive_aggressive: -0.2,
    },
    skills: {},
  },
  magicc5: {
    value: 3,
    level: 1,
    binaries: {
      evil_good: 0.1,
    },
    skills: {},
  },
  shrimp02: {
    value: 3,
    level: 1,
    binaries: {
      poor_wealthy: 0.1,
    },
    skills: {
      charisma: -1,
    },
  },
  avacado: {
    value: 3,
    level: 1,
    binaries: {
      anti_authority: -0.1,
    },
    skills: {
      charisma: 1,
    },
  },
  gold: {
    value: 10,
    level: 1,
    binaries: {
      poor_wealthy: 0.4,
    },
    skills: {},
  },
  cape: {
    value: 4,
    level: 1,
    binaries: {
      evil_good: -0.1,
    },
    skills: {},
  },
  glove01: {
    value: 3,
    level: 1,
    binaries: {
      passive_aggressive: 0.1,
    },
    skills: {},
  },
  banana: {
    value: 2,
    level: 1,
    binaries: {
      un_educated: -0.1,
    },
    skills: {},
  },
  string: {
    value: 1,
    level: 1,
    binaries: {
      un_educated: 0.1,
    },
    skills: {},
  },
  mirror: {
    value: 1,
    level: 1,
    binaries: {},
    skills: {
      perception: -1,
    },
  },
  leaf03: {
    value: 1,
    level: 1,
    binaries: {
      poor_wealthy: -0.1,
    },
    skills: {
      stealth: -1,
    },
  },
  leaf01: {
    value: 1,
    level: 1,
    binaries: {},
    skills: {
      stealth: -1,
    },
  },
  magicb2: {
    value: 3,
    level: 1,
    binaries: {
      evil_good: -0.1,
    },
    skills: {},
  },
  leaf02: {
    value: 1,
    level: 1,
    binaries: {},
    skills: {
      stealth: -2,
    },
  },
  mushroom02: {
    value: 4,
    level: 1,
    binaries: {},
    skills: {
      wisdom: 2,
      intelligence: -2,
    },
  },
  orange: {
    value: 2,
    level: 1,
    binaries: {},
    skills: {
      constitution: 1,
    },
  },
  mushroom03: {
    value: 5,
    level: 1,
    binaries: {},
    skills: {
      wisdom: 3,
      intelligence: -3,
    },
  },
  tomato: {
    value: 2,
    level: 1,
    binaries: {},
    skills: {
      perception: 1,
    },
  },
  axe: {
    value: 5,
    level: 1,
    binaries: {},
    skills: {
      constitution: 1,
      speed: -1,
    },
  },
  ring: {
    value: 8,
    level: 1,
    binaries: {},
    skills: {
      wisdom: 1,
      constitution: -1,
    },
  },
  bronze: {
    value: 6,
    level: 1,
    binaries: {},
    skills: {
      wisdom: 1,
      constitution: -1,
    },
  },
  potion: {
    value: 5,
    level: 1,
    binaries: {},
    skills: {
      charisma: 1,
      strength: -1,
    },
  },
  berry02: {
    value: 3,
    level: 1,
    binaries: {},
    skills: {
      strength: 1,
      wisdom: -1,
    },
  },
  egg01: {
    value: 2,
    level: 1,
    binaries: {},
    skills: {
      stealth: 1,
      speed: -1,
    },
  },
  envelope: {
    value: 1,
    level: 1,
    binaries: {},
    skills: {
      perception: 1,
      charisma: -1,
    },
  },
  vial01: {
    value: 2,
    level: 1,
    binaries: {},
    skills: {
      intelligence: 1,
      stealth: -1,
    },
  },
  vial02: {
    value: 7,
    level: 1,
    binaries: {
      un_educated: 0.2,
    },
    skills: {
      intelligence: 2,
      constitution: 2,
    },
  },
  fish01: {
    value: 3,
    level: 1,
    binaries: {},
    skills: {
      charisma: -1,
      strength: 1,
    },
  },
  shears: {
    value: 4,
    level: 1,
    binaries: {},
    skills: {
      speed: -1,
      perception: 1,
    },
  },
  cheese: {
    value: 2,
    level: 1,
    binaries: {},
    skills: {
      constitution: -1,
    },
  },
  pillow: {
    value: 2,
    level: 2,
    binaries: {},
    skills: {
      strength: -3,
      stealth: 3,
    },
  },
  steak01: {
    value: 3,
    level: 2,
    binaries: {},
    skills: {
      perception: -1,
      constitution: 1,
    },
  },
  steak02: {
    value: 4,
    level: 2,
    binaries: {},
    skills: {
      perception: -3,
      constitution: 3,
    },
  },
  shrimp01: {
    value: 4,
    level: 2,
    binaries: {},
    skills: {
      wisdom: -3,
    },
  },
  daisy: {
    value: 4,
    level: 2,
    binaries: {
      passive_aggressive: -0.2,
    },
    skills: {
      wisdom: 2,
    },
  },
  earrings: {
    value: 9,
    level: 2,
    binaries: {},
    skills: {
      stealth: -3,
      charisma: 3,
    },
  },
  coingold: {
    value: 10,
    level: 1,
    binaries: {},
    skills: {
      intelligence: -1,
      wisdom: 1,
    },
  },
  book: {
    value: 5,
    level: 1,
    binaries: {},
    skills: {
      intelligence: 1,
    },
  },
  rose: {
    value: 6,
    level: 1,
    binaries: {},
    skills: {
      charisma: 1,
    },
  },
  coffeemug: {
    value: 2,
    level: 1,
    binaries: {},
    skills: {
      speed: 1,
      perception: -1,
    },
  },
  mallot: {
    value: 4,
    level: 1,
    binaries: {},
    skills: {
      strength: 1,
      wisdom: -1,
    },
  },
  apple: {
    value: 2,
    level: 1,
    binaries: {},
    skills: {
      constitution: 1,
    },
  },
  mushroom01: {
    value: 1,
    level: 1,
    binaries: {},
    skills: {
      wisdom: 1,
      strength: -1,
    },
  },
  sack: {
    value: 1,
    level: 1,
    binaries: {},
    skills: {
      stealth: 1,
      speed: -1,
    },
  },
  eyeball01: {
    value: 0,
    level: 1,
    binaries: {},
    skills: {
      perception: 1,
      charisma: -1,
    },
  },
  fish02: {
    value: 2,
    level: 1,
    skills: {
      stealth: -2,
    },
    binaries: {
      passive_aggressive: 0.2,
    },
  },
  note: {
    value: 2,
    level: 1,
    skills: {
      charisma: 1,
    },
    binaries: {
      evil_good: 0.1,
    },
  },
  apple01: {
    value: 2,
    level: 1,
    skills: {
      intelligence: 1,
    },
    binaries: {
      anti_authority: 0.1,
    },
  },
}
export const inventoryLookup: { [key: string]: string } = {}
function buildLookup() {
  let itemKey: keyof typeof items
  for (itemKey in items) {
    inventoryLookup[hash_to_hex(hash(itemKey))] = itemKey
  }
}

// testjpf generate_random_gift() food, supplies, money

//testjpf may need a binaries_chest_bonus()
export function remove_chest_bonus(actor: Npc | PlayerState, i: string) {
  const item: InventoryTableItem = items[i]
  let sKey: keyof typeof item.skills

  for (sKey in items[i].skills)
    actor.skills[sKey] = actor.skills[sKey] - items[i].skills[sKey]

  let bKey: keyof typeof item.binaries

  for (bKey in items[i].binaries)
    actor.binaries[bKey] = actor.binaries[bKey] - items[i].binaries[bKey]
}

export function add_chest_bonus(actor: Npc | PlayerState, i: string) {
  const item: InventoryTableItem = items[i]
  let sKey: keyof typeof item.skills
  for (sKey in items[i].skills)
    actor.skills[sKey] = actor.skills[sKey] + items[i].skills[sKey]

  let bKey: keyof typeof item.binaries

  for (bKey in items[i].binaries)
    actor.binaries[bKey] = actor.binaries[bKey] + items[i].binaries[bKey]
}

export function remove_random(to_inv: string[], from_inv: string[]) {
  const stolen_item = shuffle(from_inv).pop()
  if (stolen_item === undefined) return ''
  if (stolen_item !== '') to_inv.push(stolen_item)
  return stolen_item
}

export function remove_last(to_inv: string[], from_inv: string[]) {
  const stolen_item = from_inv.pop()
  if (stolen_item === undefined) return ''
  if (stolen_item !== '') to_inv.push(stolen_item)
  return stolen_item
}
//testjpf amke this one alway fire for testing
export function remove_advantageous(
  to_inv: string[],
  from_inv: string[],
  skills: Skills
) {
  if (from_inv.length < 1) return ''
  //const order = utils.create_ipairs(skills)
  const order = Object.entries(skills)

  order.sort((a: [string, number], b: [string, number]) => b[1] - a[1])

  //order.sort((a, b) => skills[a] > skills[b] )
  let found = false
  let stolen_item = ''

  for (const desire of order) {
    let count = 0
    for (const item of from_inv) {
      const stats: InventoryTableItem = items[item]
      let sKey: keyof typeof stats.skills
      for (sKey in stats.skills) {
        const value = stats.skills[sKey]
        if (value > 0 && sKey == desire[0]) {
          stolen_item = from_inv.splice(count, 1)[0]
          found = true
          break
        }
      }
      if (found == true) break
      count++
    }
    if (found == true) break
  }
  if (found == false) {
    stolen_item = from_inv.splice(0, 1)[0]
    to_inv.push(stolen_item)
  }
  return stolen_item
}

export function remove_valuable(to_inv: string[], from_inv: string[]) {
  /** 
	for _, iv in ipairs(from_inv) do
		print("iv:",iv)
		print("M.items[iv].value:",M.items[iv].value)
	}
	**/
  if (from_inv.length < 1) return ''

  from_inv.sort((a: string, b: string) => items[a].value - items[b].value)
  let stolen_item = from_inv.pop()

  if (stolen_item === undefined) stolen_item = ''
  //table.sort(from_inv, function(x, y) return M.items[x].value > M.items[y].value })

  if (stolen_item !== '') to_inv.push(stolen_item)
  return stolen_item
}

export function get_extorted(s: string, w: string) {
  const s_inv = npcs.all[s].inventory
  const w_inv = npcs.all[w].inventory

  if (s_inv.length > 0) {
    for (let i = s_inv.length - 1; i >= 0; i--) {
      if (items[s_inv[i]].value > 1) {
        const loot = s_inv.splice(i, 1)

        w_inv.push(...loot)
        break
      } else {
        print('bribe failed so punch???')
        // bribe failed so punch???
      }
    }
  }
}
export function bribe_check(suspect: string, watcher: string): Consequence {
  //     wb.lawless_lawful < -0.4 &&
  // ws.strength >= ss.strength &&
  //  sb.passive_aggressive < 0.0

  //testjpf GOOD time for a diceroll
  const w = npcs.all[watcher]
  const s = npcs.all[suspect]
  //so
  /**
   * what advantages do we want to give? w love? not a bin or skill
   */

  const modifier = Math.round(
    w.binaries.lawless_lawful * -5 + w.skills.strength - s.skills.strength
  )
  const advantage =
    s.binaries.passive_aggressive < w.binaries.passive_aggressive - 0.3
  const result = roll_special_dice(5, advantage, 3, 2) + clamp(modifier, -3, 3)

  print('TESTJPF RESULT::: bribe', result)
  if (result > 5 && result <= 10) {
    get_extorted(suspect, watcher)
    return { pass: true, type: 'bribe' }
  }

  if (result > 10) {
    print('SPECIAL bribe')
    return { pass: true, type: 'special' }
  }
  if (result <= 1) {
    print('NEVER bribe')
    return { pass: true, type: 'critical' }
  }
  //won't like you,
  // slander you to people close to them / who like them / they like / cohort with
  // decreases others love for player

  return { pass: false, type: 'neutral' }
}

buildLookup()
