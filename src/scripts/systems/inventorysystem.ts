import { InventoryTableItem, Skills } from '../../types/state'
import { Consequence } from '../../types/tasks'
import { itemStateInit } from '../states/inits/inventoryInitState'
//import NpcState from '../states/npc'
import { roll_special_dice } from '../utils/dice'
import { clamp, shuffle } from '../utils/utils'
const { npcs, player } = globalThis.game.world

//TESTJPf move to types

/** 
export function inventory_init() {
  let nKey: keyof typeof npcs.all
  for (nKey in npcs.all) {
    for (const item of npcs.all[nKey].inventory) {
      add_chest_bonus(npcs.all[nKey], item)
    }
  }
  for (const item of player.inventory) {
    add_chest_bonus(player.state, item)
  }
}
*/
export const inventoryLookup: { [key: string]: string } = {}
function buildLookup() {
  let itemKey: keyof typeof itemStateInit
  for (itemKey in itemStateInit) {
    inventoryLookup[hash_to_hex(hash(itemKey))] = itemKey
  }
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
export function remove_advantageous(
  to_inv: string[],
  from_inv: string[],
  skills: Skills
) {
  if (from_inv.length < 1) return ''
  if (from_inv.length === 1) return remove_last(to_inv, from_inv)
  const order = Object.entries(skills)

  order.sort((a: [string, number], b: [string, number]) => b[1] - a[1])

  let found = false
  let stolen_item = ''

  for (const desire of order) {
    let count = 0
    for (const item of from_inv) {
      const stats: InventoryTableItem =
        itemStateInit[item as keyof InventoryTableItem]
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
		//print("iv:",iv)
		//print("M.itemStateInit[iv].value:",M.itemStateInit[iv].value)
	}
	**/
  if (from_inv.length < 1) return ''
  if (from_inv.length === 1) return remove_last(to_inv, from_inv)
  from_inv.sort(
    (a: string, b: string) => itemStateInit[a].value - itemStateInit[b].value
  )
  let stolen_item = from_inv.pop()

  if (stolen_item === undefined) stolen_item = ''
  //table.sort(from_inv, function(x, y) return M.itemStateInit[x].value > M.itemStateInit[y].value })

  if (stolen_item !== '') to_inv.push(stolen_item)
  return stolen_item
}

export function get_extorted(s: string, w: string) {
  const s_inv = npcs.all[s].inventory
  const w_inv = npcs.all[w].inventory

  if (s_inv.length > 0) {
    for (let i = s_inv.length - 1; i >= 0; i--) {
      if (itemStateInit[s_inv[i]].value > 1) {
        const loot = s_inv.splice(i, 1)

        w_inv.push(...loot)
        break
      } else {
        //print('bribe failed so punch???')
        // bribe failed so punch???
      }
    }
  }
}
export function bribe_check(suspect: string, watcher: string): Consequence {
  const w = npcs.all[watcher]
  const s = suspect === 'player' ? player.state : npcs.all[suspect]

  const modifier = Math.round(
    w.binaries.lawless_lawful * -5 + w.skills.strength - s.skills.strength
  )
  const advantage =
    s.binaries.passive_aggressive < w.binaries.passive_aggressive - 0.3
  const result = roll_special_dice(5, advantage, 3, 2) + clamp(modifier, -3, 3)

  //print('TESTJPF RESULT::: bribe', result)
  if (result > 5 && result <= 10) {
    get_extorted(suspect, watcher)
    return { pass: true, type: 'bribe' }
  }

  if (result > 10) {
    //print('SPECIAL bribe')
    return { pass: true, type: 'special' }
  }
  if (result <= 1) {
    //print('NEVER bribe')
    return { pass: true, type: 'critical' }
  }

  return { pass: false, type: 'neutral' }
}

buildLookup()
