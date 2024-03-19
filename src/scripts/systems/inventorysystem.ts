import { Npc, PlayerState, Skills } from '../../types/state'
import { shuffle } from '../utils/utils'

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

/**
!!! testjpf, loopthrough and create hastable and add hash as property to each item?
const room_lookup = {
  [hash_to_hex(hash('/to_baggage'))]: 'baggage',
  [hash_to_hex(hash('/to_grounds'))]: 'grounds',
  [hash_to_hex(hash('/to_reception'))]: 'reception',
  [hash_to_hex(hash('/to_customs'))]: 'customs',
  [hash_to_hex(hash('/to_admin1'))]: 'admin1',
  [hash_to_hex(hash('/to_security'))]: 'security',
  [hash_to_hex(hash('/to_infirmary'))]: 'infirmary',
  so loopthru get key hextohash to new key of new table. value equals old key
}
**/

//testjpf may need a binaries_chest_bonus()
export function remove_chest_bonus(actor: Npc | PlayerState, i: string) {
  print('testjpf: is i anything', i)
  const item: InventoryTableItem = items[i]
  let sKey: keyof typeof item.skills

  for (sKey in items[i].skills)
    actor.skills[sKey] = actor.skills[sKey] - items[i].skills[sKey]

  let bKey: keyof typeof item.binaries

  for (bKey in items[i].binaries)
    actor.binaries[bKey] = actor.binaries[bKey] - items[i].binaries[bKey]
}

export function add_chest_bonus(actor: Npc | PlayerState, i: string) {
  print('ADD testjpf: is i anything', i)

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
  print('remove_ random', stolen_item)
  if (stolen_item !== '') to_inv.push(stolen_item)
  return stolen_item
}

export function remove_last(to_inv: string[], from_inv: string[]) {
  const stolen_item = from_inv.pop()
  if (stolen_item === undefined) return ''
  print('remove_ last', stolen_item)
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
  let count = 0

  for (const desire of order) {
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
  print('print adv!!!', stolen_item)
  if (found == false) {
    stolen_item = from_inv.splice(0, 1)[0]
    print('remove_ advFALLBACK', stolen_item)
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

  print('remove_ valueable', stolen_item)
  if (stolen_item !== '') to_inv.push(stolen_item)
  return stolen_item
}

buildLookup()
