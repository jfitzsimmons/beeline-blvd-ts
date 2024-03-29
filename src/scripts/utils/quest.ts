import { Npc, Npcs, Skills } from '../../types/state'
import { shuffle } from './utils'

export function has_value(t: [() => string[], string]) {
  return t[0]().includes(t[1])
}

export function any_has_value(t: [() => Npc[], string]) {
  const npcs = t[0]()
  for (const npc of npcs) {
    if (npc.inventory.includes(t[1])) return true
  }
  return false
}

export function returnfalse() {
  return false
}

export function convos_check(args: [() => Npcs, number]): boolean {
  const npcs = args[0]()
  let nKey: keyof typeof npcs
  for (nKey in npcs) {
    if (npcs[nKey].convos >= args[1]) return true
  }
  return false
}

export function max_skills(args: [() => Skills, number]) {
  const skills = args[0]()
  const order = Object.entries(skills)

  order.sort((a: [string, number], b: [string, number]) => b[1] - a[1])

  for (let i = args[1]; i-- !== 0; ) {
    if (order[i][1] < 10) {
      return false
    }
  }
  return true
}

export function max_love(args: [() => [string[], Npcs], number]): boolean {
  let count = 10
  let score = 0
  const all = args[0]()
  const shuffled = shuffle(all[0])
  for (const npcname of shuffled) {
    if (all[1][npcname].love > 5) {
      score = score + 1
    }
    count = count - 1
    if (score > args[1]) return true
    if (count == 0) return false
  }
  return false
}
