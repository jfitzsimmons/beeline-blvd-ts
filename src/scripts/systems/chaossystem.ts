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
    player.state.traits.skills.wisdom +
      player.state.traits.binaries.un_educated * 10 -
      npc.traits.skills.charisma +
      Math.abs(npc.traits.binaries.evil_good * 10)
  )
  const advantage =
    player.state.traits.skills.speed +
      player.state.traits.binaries.lawlessLawful * 10 >
    npc.traits.binaries.evil_good * 10 + npc.traits.skills.constitution
  const result = math.min(
    rollSpecialDice(5, advantage, 3, 2) + (modifier > -1 ? modifier : -1),
    rollSpecialDice(5, advantage, 3, 2) + (modifier > -2 ? modifier : -2)
  )

  if (result > 1 && result < 5) return { pass: true, type: 'lovedrop' }

  if (result <= 1) return { pass: true, type: 'critical' }
  return { pass: false, type: 'neutral' }
}

//Misc. Checks

//Checks and Helpers
//state changes

//export function tasks.outcomes.lConfrontPunchT(s: string, _w: string, hit = 1) {
//  npcs.all[s].hp = npcs.all[s].hp - hit
//}

/** 
export function recklessCheck(suspect: string, watcher: string): Consequence {
  //print(suspect, 'reckless suspect!!!!')
  const w = npcs.all[watcher]
  const s = suspect === 'player' ? player.state : npcs.all[suspect]

  const modifier = Math.round(
    w.traits.binaries.evil_good * -5 -
      w.traits.skills.wisdom -
      s.traits.skills.stealth +
      Math.abs(s.traits.binaries.passiveAggressive) * 5
  )
  const advantage =
    w.traits.skills.intelligence < 5 || w.traits.binaries.lawlessLawful < -0.1
  const result = rollSpecialDice(5, advantage, 3, 2) + clamp(modifier, -3, 3)

  //print('TESTJPF RESULT::: reckless', result)
  if (result > 5 && result <= 10) {
    return { pass: true, type: 'reckless' }
  }

  if (result > 10) {
    //print('SPECIAL reckless')
    return { pass: true, type: 'special' }
  }
  if (result <= 1) {
    //print('NEVER reckless')
    return { pass: true, type: 'critical' }
  }

  return { pass: false, type: 'neutral' }
}*/
//Checks and Helpers
//misc.
