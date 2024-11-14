import { InventoryTableItem, Trait } from '../../types/state'
import { itemStateInit } from '../states/inits/inventoryInitState'
import { shuffle } from '../utils/utils'

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
  const order = Object.entries(skills).sort(
    (a: [string, number], b: [string, number]) => b[1] - a[1]
  )

  let found = false
  let stolenItem = ''
  for (const desire of order) {
    let count = 0
    for (const item of fromInv) {
      const stats: InventoryTableItem = {
        ...itemStateInit[item as keyof InventoryTableItem],
      }
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
  return stolenItem
}

export function removeValuable(toInv: string[], fromInv: string[]) {
  if (fromInv.length < 1) return ''
  if (fromInv.length === 1) return removeLast(toInv, fromInv)
  fromInv.sort(
    (a: string, b: string) => itemStateInit[a].value - itemStateInit[b].value
  )
  let stolenItem = fromInv.pop()

  if (stolenItem === undefined) stolenItem = ''

  if (stolenItem !== '') toInv.push(stolenItem)
  return stolenItem
}

buildLookup()
