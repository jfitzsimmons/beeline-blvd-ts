import { Consequence } from '../../types/tasks'
import { rollSpecialDice } from '../utils/dice'
import { clamp, shuffle } from '../utils/utils'
import { add_prejudice } from './effectsystem'
//import { go_to_jail, add_pledge } from './emergencysystem'
import { removeAdvantageous } from './inventorysystem'
//import { add_pledge } from './systemshelpers'

const { npcs, player, tasks } = globalThis.game.world

export const pos_consolations = [
  charmed_merits,
  ap_boost,
  given_gift,
  love_boost,
]
export const neg_consolations = [
  tasks.checks.recklessCheck.bind(this),
  love_drop,
  tasks.checks.suspicious_check.bind(this),
]

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

//positive consolations
function generate_gift() {
  player.state.inventory.push('berry02')
}
function given_gift(n: string): Consequence {
  //testjpf check if inventory full?!
  const gift = removeAdvantageous(
    player.state.inventory,
    npcs.all[n].inventory,
    player.state.traits.skills
  )

  if (gift == null) generate_gift()
  return { pass: true, type: 'gift' }
}
function love_boost(n: string): Consequence {
  const npc = npcs.all[n]

  const modifier = Math.round(
    Math.abs(player.state.traits.binaries.evil_good) * 10 -
      npc.traits.skills.speed
  )
  const advantage =
    player.state.traits.skills.charisma +
      player.state.traits.skills.intelligence +
      npc.traits.binaries.anti_authority * 10 >
    npc.traits.skills.intelligence +
      npc.traits.skills.perception +
      player.state.traits.skills.speed
  const result = math.min(
    rollSpecialDice(5, advantage, 3, 2) + (modifier > -2 ? modifier : -2),
    rollSpecialDice(5, advantage, 3, 2) + clamp(modifier, -3, 3)
  )

  //print('TESTJPF RESULT::: loveboost', result)
  if (result > 5 && result <= 10) return { pass: true, type: 'loveboost' }

  if (result > 10) return { pass: true, type: 'special' }
  return { pass: false, type: 'neutral' }
}
function ap_boost(n: string): Consequence {
  const npc = npcs.all[n]

  const modifier = Math.round(
    player.state.traits.skills.constitution +
      npc.love +
      (npc.traits.binaries.passiveAggressive * 10) / 3
  )
  const advantage =
    player.state.traits.binaries.passiveAggressive +
      npc.traits.binaries.passiveAggressive >
      0.1 && npc.traits.skills.constitution > player.state.traits.skills.speed
  const result =
    rollSpecialDice(5, advantage, 3, 2) + (modifier > -1 ? modifier : -1)

  //print('TESTJPF RESULT::: apboost', result)
  if (result > 5 && result <= 10) return { pass: true, type: 'apboost' }

  if (result > 10) return { pass: true, type: 'special' }
  return { pass: false, type: 'neutral' }
}
function charmed_merits(n: string): Consequence {
  const npc = npcs.all[n]
  const modifier = Math.round(
    (player.state.traits.skills.charisma + npc.love) / 2 -
      npc.traits.skills.constitution
  )
  const advantage =
    player.state.traits.skills.charisma > npc.traits.skills.charisma &&
    npc.traits.binaries.un_educated < -0.1
  const result =
    rollSpecialDice(5, advantage, 3, 2) + (modifier > -1 ? modifier : -1)

  //print('TESTJPF RESULT:::charmedmerits', result)
  if (result > 5 && result <= 10) return { pass: true, type: 'merits' }

  if (result > 10) return { pass: true, type: 'special' }

  return { pass: false, type: 'neutral' }
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

function call_security(watcher: string, suspect: string) {
  npcs.all[watcher].clan == 'security'
    ? tasks.methods.returnNpc(suspect).fsm.setState('arrestee')
    : tasks.taskBuilder(
        watcher,
        math.random() > 0.33 ? 'questioning' : 'arrest',
        suspect,
        'unlucky'
      )
}
//Misc. Checks

export function unlucky_check(watcher: string, suspect: string): Consequence {
  const modifier = math.random(-1, 1)
  const advantage = math.random() > 0.5
  const result = rollSpecialDice(5, advantage, 3, 2) + modifier
  //print('TESTJPF RESULT UNLUCKY:::', result)
  if (result > 5 && result <= 10) {
    const random = math.random(0, 4)
    if (random == 0) tasks.outcomes.getExtorted(suspect, watcher)
    else if (random == 1) tasks.outcomes.lConfrontPunchT(suspect)
    else if (random == 2) tasks.outcomes.addPledge(suspect)
    else if (random == 3) call_security(watcher, suspect)
    else if (random == 4) add_prejudice(suspect, watcher)

    return { pass: true, type: 'unlucky' }
  }

  if (result > 10) {
    //print('SPECIAL unlucky')
    call_security(suspect, watcher)
    return { pass: true, type: 'special' }
  }
  if (result <= 1) {
    //print('NEVER unlucky')
    shuffle(pos_consolations)[0](suspect)
    return { pass: true, type: 'critical' }
  }

  return { pass: false, type: 'neutral' }
}

//Checks and Helpers
//state changes

//export function tasks.outcomes.lConfrontPunchT(s: string, _w: string, hit = 1) {
//  npcs.all[s].hp = npcs.all[s].hp - hit
//}
export function watcher_punched_check(
  suspect: string,
  watcher: string
): Consequence {
  const w = npcs.all[watcher]
  const s = suspect === 'player' ? player.state : npcs.all[suspect]
  const modifier = Math.round(
    s.traits.binaries.lawlessLawful * -5 +
      s.traits.skills.strength -
      w.traits.skills.strength -
      w.traits.skills.wisdom
  )
  const advantage =
    s.traits.binaries.passiveAggressive * 7 > w.traits.skills.speed
  const result = rollSpecialDice(5, advantage, 3, 2) + clamp(modifier, -3, 3)

  //print('TESTJPF RESULT::: s punch w', result)
  if (result > 5 && result <= 10) {
    tasks.outcomes.tConfrontPunchL(watcher, 1)
    return { pass: true, type: 'sPunchW' }
  }

  if (result > 10) {
    //print('SPECIAL sPunchW')
    tasks.outcomes.tConfrontPunchL(watcher, 3)

    return { pass: true, type: 'special' }
  }
  if (result <= 1) {
    //print('NEVER sPunchW')
    tasks.outcomes.lConfrontPunchT(suspect, 2)
    return { pass: true, type: 'critical' }
  }

  return { pass: false, type: 'neutral' }
}
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
