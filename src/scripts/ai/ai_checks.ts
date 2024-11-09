import { Actor, Npc } from '../../types/state'
import { clamp } from '../utils/utils'
const { tasks, npcs, rooms, player } = globalThis.game.world
import {
  removeAdvantageous,
  removeValuable,
  removeLast,
  removeRandom,
} from '../systems/inventorysystem'
import { confrontationConsequence } from '../systems/tasksystem'
//import { injured_npcs } from '../systems/emergencysystem'
import { rollSpecialDice } from '../utils/dice'
import NpcState from '../states/npc'
import { NpcsInitState } from '../states/inits/npcsInitState'

function tendToPatient(p: string, doc: string) {
  npcs.all[doc].fsm.setState('mender')
  npcs.all[p].fsm.setState('mendee')
  tasks.removeHeat(p)
  tasks.taskBuilder(doc, 'mender', p, 'injury')
  tasks.addAdjustMendingQueue(p)

  if (npcs.all[doc].currRoom == player.currRoom)
    msg.post(`/${npcs.all[doc].currStation}#npc_loader`, hash('move_npc'), {
      station: npcs.all[p].currStation,
      npc: doc,
    })
}

export function aidCheck() {
  for (const i of npcs.injured.filter(
    (n): n is string => !npcs.ignore.includes(n)
  )) {
    const helpers = Object.values(rooms.all[npcs.all[i].currRoom].stations)
      .filter((s) => s != '')
      .sort(function (a, b) {
        if (a.slice(0, 3) === 'doc' && b.slice(0, 3) !== 'doc') return -1
        if (b.slice(0, 3) === 'doc' && a.slice(0, 3) !== 'doc') return 1
        return 0
      })
    for (const helper of helpers) {
      if (helper != i) {
        //doctors start mending after RNG weighted by patient priority
        const ticket = tasks.mendingQueue.indexOf(i)
        const random = math.random(0, 5)
        if (
          NpcsInitState[helper].clan == 'doctors' &&
          ((ticket != -1 && ticket < random) || (ticket == -1 && random > 3))
        ) {
          tendToPatient(i, helper)
          break
        } else if (
          math.random() > 0.6 &&
          tasks.npcHasTask(helper, i) === null &&
          NpcsInitState[helper].clan !== 'doctors'
        ) {
          //if not a doctor, create injury caution if haven't already
          tasks.taskBuilder(helper, 'injury', i, 'injury')
          break
        }
      }
    }
  }
}
export function take_check(taker: NpcState, actor: Npc | Actor) {
  const { skills, binaries } = taker.traits
  let modifier = Math.round(
    skills.stealth - skills.charisma + binaries.passiveAggressive * -5
  )
  if (tasks.npcHasTask('any', taker.name) != null) {
    modifier = modifier - 1
  }
  const advantage = binaries.poor_wealthy + binaries.anti_authority * -1 > 0
  const result = rollSpecialDice(5, advantage, 3, 2) + clamp(modifier, -2, 2)
  if (result < 5) return false

  let chest_item = null
  if (math.random() < 0.5) {
    chest_item = removeValuable(taker.inventory, actor.inventory)
  } else if (math.random() < 0.51) {
    chest_item = removeAdvantageous(taker.inventory, actor.inventory, skills)
  } else {
    chest_item = removeRandom(taker.inventory, actor.inventory)
  }
  taker.addInvBonus(chest_item)
}
export function stash_check(stasher: NpcState, actor: NpcState | Actor) {
  let modifier = stasher.inventory.length - actor.inventory.length

  if (tasks.npcHasTask('any', stasher.name) != null) {
    modifier = modifier + 1
  }

  const advantage = actor.inventory.length < 2 || stasher.inventory.length > 5
  const result = rollSpecialDice(5, advantage, 3, 2) + modifier
  if (result < 5) return false

  let chest_item: string | null = null
  if (math.random() < 0.5) {
    chest_item = removeValuable(actor.inventory, stasher.inventory)
  } else if (math.random() < 0.51) {
    chest_item = removeAdvantageous(
      actor.inventory,
      stasher.inventory,
      stasher.traits.skills
    )
  } else {
    chest_item = removeLast(actor.inventory, stasher.inventory)
  }
  stasher.removeInvBonus(chest_item)
  // if victim == true ){ add_chest_bonus(n, chest_item) }
}
export function take_or_stash(attendant: NpcState, actor: NpcState | Actor) {
  if (
    actor.inventory.length > 0 &&
    (attendant.inventory.length == 0 || math.random() < 0.5)
  ) {
    take_check(attendant, actor)
  } else if (attendant.inventory.length > 0) {
    stash_check(attendant, actor)
  }
}
export function seen_check(s: string, w: string) {
  const sus = s == 'player' ? player.state : npcs.all[s]
  const wchr = npcs.all[w]
  const heat =
    s == 'player' ? player.heat * 10 : wchr.traits.binaries.poor_wealthy * -4

  const modifier = Math.round(
    sus.traits.skills.stealth +
      sus.traits.binaries.lawlessLawful * -4 -
      wchr.traits.skills.stealth -
      wchr.traits.skills.perception -
      heat
  )
  const advantage =
    sus.traits.skills.speed - wchr.traits.binaries.lawlessLawful * 5 >
    wchr.traits.skills.speed +
      wchr.traits.skills.constitution +
      wchr.traits.binaries.passiveAggressive * 5

  const result = rollSpecialDice(5, advantage, 3, 2) + clamp(modifier, -3, 3)

  if (result > 10) return { confront: false, type: 'seenspecial' }
  if (result < 0) return { confront: true, type: 'critcal' }
  const bossResult = rollSpecialDice(7, true, 3, 2)
  const seen = result <= bossResult
  return seen === true
    ? { confront: false, type: 'seen' }
    : { confront: false, type: 'neutral' }
}
//TESTJPF this could probably be like
// medical() on NPCS youve ben going for
//player already moved!!
export function clearance_checks() {
  const cops = npcs.return_security()
  for (const cop of cops) {
    const stations = rooms.all[cop.currRoom].stations
    let sKey: keyof typeof stations
    let target = ''
    for (sKey in stations) {
      target = stations[sKey]
      if (
        target !== '' &&
        npcs.all[target].fsm.getState() === 'trespass' &&
        target !== cop.name &&
        confrontation_check(target, cop.name) == true
        //  target !== tasks.task_has_npc(target)
      ) {
        print('NEWQUESTIONED!!!', cop.name, target)
        //npcs.all[target].fsm.setState('questioned')
        //cop.fsm.setState('interrogate')
        tasks.taskBuilder(cop.name, 'questioning', target, 'clearance')
        break
        //testjpf needs a diceroll and create / return confrontation
      }
      target = 'player'
    }
    if (
      target == 'player' &&
      cop.currRoom == player.currRoom &&
      player.fsm.getState() == 'trespass' &&
      confrontation_check('player', cop.name) == true
    ) {
      // player.fsm.setState('questioned')
      // cop.fsm.setState('interrogate')
      tasks.taskBuilder(cop.name, 'questioning', 'player', 'clearance')
    }
  }
}
export function confrontation_check(pname: string, nname: string) {
  if ([pname, nname].includes('')) return false
  const s = pname == 'player' ? player.state : npcs.all[pname]
  const w = npcs.all[nname]

  const modifier = Math.round(
    w.traits.binaries.lawlessLawful * 5 -
      s.traits.skills.speed +
      w.traits.skills.speed -
      w.traits.skills.constitution
  )
  const advantage =
    w.traits.skills.speed + w.traits.skills.constitution >
    s.traits.skills.speed + w.traits.binaries.lawlessLawful * 5
  const result = rollSpecialDice(5, advantage, 3, 2) + clamp(modifier, -3, 3)
  const bossResult = rollSpecialDice(5, true, 4, 2)

  return bossResult >= result
}
function thief_consequences(
  s: string,
  w: string,
  c: { confront: boolean; type: string }
) {
  if (npcs.all[w] != null && c.type == 'seen') {
    c.confront =
      s == 'player' && (c.confront == true || confrontation_check(s, w))
    c.type = confrontationConsequence(s, w, c.confront)
  }

  if (c.confront == false && c.type != 'neutral') {
    tasks.taskBuilder(w, c.type, s, 'theft')
  }
  return c
}
// only being used between npcs (just tutorial luggage)
export function steal_check(s: NpcState, w: NpcState, loot: string[]) {
  // accept strings not Npcs
  // const attempt = roll_Specia_dice
  if (s.cooldown > 0) return

  const modifier = Math.round(
    s.traits.skills.speed +
      s.traits.skills.stealth -
      s.cooldown +
      w.traits.opinion[s.clan] -
      s.traits.opinion[w.clan] * 3
  )
  const advantage =
    s.traits.binaries.lawlessLawful +
      s.traits.binaries.evil_good -
      s.traits.binaries.poor_wealthy <
    w.traits.binaries.evil_good + w.traits.binaries.lawlessLawful
  const result =
    rollSpecialDice(5, advantage, 3, 2) + (modifier > -3 ? modifier : -3)

  if (result < 5) return false

  let consequence = {
    confront: false,
    type: 'neutral',
  }
  if (w != null) {
    consequence = seen_check(s.name, w.name)
    consequence = thief_consequences(s.name, w.name, consequence)
  }
  //consequence = confront.type

  if (consequence.type == 'neutral') {
    let chest_item = null
    //const victim = false
    //if w != null ){ utils.has_value(w.inventory, a[1]) }

    if (math.random() < 0.4) {
      chest_item = removeRandom(s.inventory, loot)
    } else if (math.random() < 0.5) {
      chest_item = removeValuable(s.inventory, loot)
    } else {
      chest_item = removeAdvantageous(s.inventory, loot, s.traits.skills)
    }

    s.addInvBonus(chest_item)
    //if (victim == true ){ remove_chest_bonus(w, chest_item) }
    s.cooldown = math.random(5, 15)
  }

  s.cooldown = s.cooldown + 5
}
// player interact.gui related
export function witness_player(w: string) {
  let consequence = {
    confront: false,
    type: 'neutral',
  }

  consequence = seen_check('player', w)

  consequence = thief_consequences('player', w, consequence)

  return consequence
}
