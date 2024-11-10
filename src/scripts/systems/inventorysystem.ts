import { InventoryTableItem, Trait } from '../../types/state'
//import { Consequence } from '../../types/tasks'
import { itemStateInit } from '../states/inits/inventoryInitState'
//import NpcState from '../states/npc'
//import { rollSpecialDice } from '../utils/dice'
import { shuffle } from '../utils/utils'
//const { npcs } = globalThis.game.world

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

export function removeRandom(toInv: string[], fromInv: string[]) {
  const stolenItem = shuffle(fromInv).pop()
  if (stolenItem === undefined) return ''
  if (stolenItem !== '') toInv.push(stolenItem)
  return stolenItem
}

export function removeLast(toInv: string[], fromInv: string[]) {
  const stolenItem = fromInv.pop()
  if (stolenItem === undefined) return ''
  if (stolenItem !== '') toInv.push(stolenItem)
  return stolenItem
}
export function removeAdvantageous(
  toInv: string[],
  fromInv: string[],
  skills: Trait
) {
  if (fromInv.length < 1) return ''
  if (fromInv.length === 1) return removeLast(toInv, fromInv)
  const order = Object.entries(skills)

  order.sort((a: [string, number], b: [string, number]) => b[1] - a[1])

  let found = false
  let stolenItem = ''

  for (const desire of order) {
    let count = 0
    for (const item of fromInv) {
      const stats: InventoryTableItem =
        itemStateInit[item as keyof InventoryTableItem]
      let sKey: keyof typeof stats.skills
      for (sKey in stats.skills) {
        const value = stats.skills[sKey]
        if (value > 0 && sKey == desire[0]) {
          stolenItem = fromInv.splice(count, 1)[0]
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
    stolenItem = fromInv.splice(0, 1)[0]
    toInv.push(stolenItem)
  }
  return stolenItem
}

//!!TESTJPF NONE of these seem to update inventory bonuses!!! SPIKE

export function removeOfValue(toInv: string[], fromInv: string[]): string {
  let stolenItem = ''
  if (fromInv.length < 1) return stolenItem

  for (let i = fromInv.length - 1; i >= 0; i--) {
    if (itemStateInit[fromInv[i]].value > 1) {
      const loot = fromInv.splice(i, 1)
      stolenItem = loot[0]
      toInv.push(...loot)
      break
    }
  }
  print('OUTCOMES:: GETEXTORTEDFOR::', stolenItem)
  return stolenItem
}

export function removeValuable(toInv: string[], fromInv: string[]) {
  /** 
	for _, iv in ipairs(fromInv) do
		//print("iv:",iv)
		//print("M.itemStateInit[iv].value:",M.itemStateInit[iv].value)
	}
	**/
  if (fromInv.length < 1) return ''
  if (fromInv.length === 1) return removeLast(toInv, fromInv)
  fromInv.sort(
    (a: string, b: string) => itemStateInit[a].value - itemStateInit[b].value
  )
  let stolenItem = fromInv.pop()

  if (stolenItem === undefined) stolenItem = ''
  //table.sort(fromInv, function(x, y) return M.itemStateInit[x].value > M.itemStateInit[y].value })

  if (stolenItem !== '') toInv.push(stolenItem)
  return stolenItem
}
/**TESTJPF TOD!!! 
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
    w.traits.binaries.lawlessLawful * -5 +
      w.traits.skills.strength -
      s.traits.skills.strength
  )
  const advantage =
    s.traits.binaries.passiveAggressive <
    w.traits.binaries.passiveAggressive - 0.3
  const result = rollSpecialDice(5, advantage, 3, 2) + clamp(modifier, -3, 3)

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
  */

buildLookup()
