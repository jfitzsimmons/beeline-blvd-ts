/**  moved to npc stateimport { Effect, Consequence } from '../../types/tasks'
import { fx } from '../utils/consts'
import { rollSpecialDice } from '../utils/dice'
import { clamp } from '../utils/utils'
const { npcs, player } = globalThis.game.world

//TESTJPF ADD TO PLAYER AND NPC TODO


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
