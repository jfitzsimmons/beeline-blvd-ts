import { Consequence } from '../../types/tasks'
import { rollSpecialDice } from '../utils/dice'
import { shuffle } from '../utils/utils'

const { npcs, player, tasks } = globalThis.game.world

export const pos_consolations = [
  tasks.checks.charmed_merits.bind(this),
  tasks.checks.ap_boost.bind(this),
  tasks.outcomes.given_gift.bind(this),
  tasks.checks.love_boost.bind(this),
]
export const neg_consolations = [
  tasks.checks.recklessCheck.bind(this),
  love_drop,
  tasks.checks.suspicious_check.bind(this),
]

//These two are for Novel FSM TESTJPF
export function unimpressed_checks(s: string, w: string): string {
  const tempcons: Array<(s: string, w: string) => Consequence> =
    shuffle(neg_consolations)
  tempcons.forEach((c) => {
    const consolation = c(s, w)
    if (consolation.pass == true) return consolation.type
  })

  return 'neutral'
}
export function impressed_checks(s: string, w: string) {
  const tempcons: Array<(s: string, w: string) => Consequence> =
    shuffle(pos_consolations)
  tempcons.forEach((c) => {
    const consolation = c(s, w)
    if (consolation.pass == true) return consolation.type
  })

  return 'neutral'
}

//negative consolations
function love_drop(n: string): Consequence {
  const npc = npcs.all[n]

  const modifier = Math.round(
    player.traits.skills.wisdom +
      player.traits.binaries.un_educated * 10 -
      npc.traits.skills.charisma +
      Math.abs(npc.traits.binaries.evil_good * 10)
  )
  const advantage =
    player.traits.skills.speed + player.traits.binaries.lawlessLawful * 10 >
    npc.traits.binaries.evil_good * 10 + npc.traits.skills.constitution
  const result = math.min(
    rollSpecialDice(5, advantage, 3, 2) + (modifier > -1 ? modifier : -1),
    rollSpecialDice(5, advantage, 3, 2) + (modifier > -2 ? modifier : -2)
  )

  if (result > 1 && result < 5) return { pass: true, type: 'lovedrop' }

  if (result <= 1) return { pass: true, type: 'critical' }
  return { pass: false, type: 'neutral' }
}
