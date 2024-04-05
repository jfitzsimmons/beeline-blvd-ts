import { Actor, Npc } from '../../types/state'
import { clamp } from '../utils/utils'
const { tasks, npcs, rooms, player } = globalThis.game.world
import {
  remove_advantageous,
  remove_valuable,
  remove_last,
  remove_random,
  add_chest_bonus,
  remove_chest_bonus,
} from '../systems/inventorysystem'
import { confrontation_consequence } from '../systems/tasksystem'
import { roll_special_dice } from '../utils/dice'

function tend_to_patient(v: string, doc: string) {
  print('tending to patient', doc, v)
  tasks.medicQueue.splice(tasks.medicQueue.indexOf(v), 1)
  tasks.remove_heat(v)
  const vstation = npcs.all[v].currentstation
  const dstation = npcs.all[doc].currentstation
  if (npcs.all[doc].currentroom == player.currentroom)
    msg.post(`/${dstation}#npc_loader`, hash('move_npc'), {
      station: vstation,
      npc: doc,
    })
  tasks.caution_builder(npcs.all[doc], 'mending', v, 'field')
}

export function aid_check(injured: string[]) {
  const allInjured = [...tasks.medicQueue, ...injured]
  for (const i of allInjured) {
    const stations = rooms.all[npcs.all[i].currentroom].stations
    let sKey: keyof typeof stations
    for (sKey in stations) {
      const helper = stations[sKey]
      if (helper != '' && helper != i && math.random() < 0.3) {
        if (
          npcs.all[helper].clan == 'doctors' &&
          tasks.medicQueue.indexOf(i) != -1 &&
          tasks.medicQueue.indexOf(i) < math.random(0, 5)
        ) {
          tend_to_patient(i, helper)
          break
        } else {
          if (math.random() > 0.9 && tasks.npc_has_caution(helper, i) == null) {
            tasks.caution_builder(npcs.all[helper], 'injury', i, 'injury')
            print('injury caution created for', i, ' | HEL{ER::', helper)
            break
          }
        }
      }
    }
  }
}
export function take_check(taker: Npc, actor: Npc | Actor) {
  let modifier = Math.round(
    taker.skills.stealth -
      taker.skills.charisma +
      taker.binaries.passive_aggressive * -5
  )
  if (tasks.npc_has_caution('any', taker.labelname) != null) {
    modifier = modifier - 1
  }
  const advantage =
    taker.binaries.poor_wealthy + taker.binaries.anti_authority * -1 > 0
  const result =
    roll_special_dice(5, advantage, 3, 2) + (modifier > -2 ? modifier : -2)

  if (result < 5) return false

  let chest_item = null
  if (math.random() < 0.5) {
    chest_item = remove_valuable(taker.inventory, actor.inventory)
  } else if (math.random() < 0.51) {
    chest_item = remove_advantageous(
      taker.inventory,
      actor.inventory,
      taker.skills
    )
  } else {
    chest_item = remove_random(taker.inventory, actor.inventory)
  }
  add_chest_bonus(taker, chest_item)

  print(taker.labelname, 'TOOK an item')
}
export function stash_check(stasher: Npc, actor: Npc | Actor) {
  let modifier = stasher.inventory.length - actor.inventory.length

  if (tasks.npc_has_caution('any', stasher.labelname) != null) {
    modifier = modifier + 1
  }

  const advantage = actor.inventory.length < 2 || stasher.inventory.length > 5
  const result = roll_special_dice(5, advantage, 3, 2) + modifier
  if (result < 5) return false

  let chest_item: string | null = null
  if (math.random() < 0.5) {
    chest_item = remove_valuable(actor.inventory, stasher.inventory)
  } else if (math.random() < 0.51) {
    chest_item = remove_advantageous(
      actor.inventory,
      stasher.inventory,
      stasher.skills
    )
  } else {
    chest_item = remove_last(actor.inventory, stasher.inventory)
  }
  remove_chest_bonus(stasher, chest_item)
  // if victim == true ){ add_chest_bonus(n, chest_item) }

  print(stasher.labelname, 'STASHED an item')
}
export function take_or_stash(attendant: Npc, actor: Npc | Actor) {
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
    s == 'player' ? player.heat * 10 : wchr.binaries.poor_wealthy * -4

  const modifier = Math.round(
    sus.skills.stealth +
      sus.binaries.lawless_lawful * -4 -
      wchr.skills.stealth -
      wchr.skills.perception -
      heat
  )
  const advantage =
    sus.skills.speed - wchr.binaries.lawless_lawful * 5 >
    wchr.skills.speed +
      wchr.skills.constitution +
      wchr.binaries.passive_aggressive * 5

  const result = roll_special_dice(5, advantage, 3, 2) + clamp(modifier, -3, 3)

  if (result > 10) return { confront: false, type: 'seenspecial' }
  if (result < 0) return { confront: true, type: 'critcal' }
  const bossResult = roll_special_dice(7, true, 3, 2)
  print(
    'SEEN CHECK:: bossResult: DICE ROLL:: boss >= result',
    bossResult,
    result
  )

  const seen = result <= bossResult
  return seen === true
    ? { confront: false, type: 'seen' }
    : { confront: false, type: 'neutral' }
}
export function confrontation_check(pname: string, nname: string) {
  // testjpf for debugging you could check if player return false
  //if (p.labelname == 'adam') return false
  const s = pname == 'player' ? player.state : npcs.all[pname]
  const w = npcs.all[nname]

  const modifier = Math.round(
    w.binaries.lawless_lawful * 5 -
      s.skills.speed +
      w.skills.speed -
      w.skills.constitution
  )
  const advantage =
    w.skills.speed + w.skills.constitution >
    s.skills.speed + w.binaries.lawless_lawful * 5
  const result = roll_special_dice(5, advantage, 3, 2) + clamp(modifier, -3, 3)
  const bossResult = roll_special_dice(5, true, 4, 2)

  print('aiCHECKS::: confrontation_check:: boss > result', bossResult, result)
  return bossResult >= result
}
function thief_consequences(
  s: string,
  w: string,
  c: { confront: boolean; type: string }
) {
  if (npcs.all[w] != null && c.type == 'seen') {
    c.confront = c.confront == true || confrontation_check(s, w)
    c.type = confrontation_consequence(s, w, c.confront)
  }

  if (c.confront == false && c.type != 'neutral') {
    tasks.caution_builder(npcs.all[w], c.type, s, 'theft')
  }
  return c
}
// testjpf only being used between npcs (just tutorial luggage)
export function steal_check(s: Npc, w: Npc, loot: string[]) {
  // accept strings not Npcs
  // const attempt = roll_Specia_dice

  const modifier = Math.round(
    s.skills.speed +
      s.skills.stealth -
      s.cooldown +
      w.attitudes[s.clan] -
      s.attitudes[w.clan] * 3
  )
  const advantage =
    s.binaries.lawless_lawful + s.binaries.evil_good - s.binaries.poor_wealthy <
    w.binaries.evil_good + w.binaries.lawless_lawful
  const result =
    roll_special_dice(5, advantage, 3, 2) + (modifier > -3 ? modifier : -3)

  if (result < 5) return false

  let consequence = {
    confront: false,
    type: 'neutral',
  }
  if (w != null) {
    consequence = seen_check(s.labelname, w.labelname)
    print('SEEN CHECK CONSEQUNCE::', consequence.type)
    consequence = thief_consequences(s.labelname, w.labelname, consequence)
    print('THIEF CONSEQUNCE::', consequence.type)
  }
  //consequence = confront.type

  if (consequence.type == 'neutral') {
    let chest_item = null
    //const victim = false
    //if w != null ){ utils.has_value(w.inventory, a[1]) }

    if (math.random() < 0.4) {
      chest_item = remove_random(s.inventory, loot)
    } else if (math.random() < 0.5) {
      chest_item = remove_valuable(s.inventory, loot)
    } else {
      chest_item = remove_advantageous(s.inventory, loot, s.skills)
    }
    print(
      s.labelname,
      'in room',
      s.currentroom,
      'stole following item:',
      chest_item
    )
    add_chest_bonus(s, chest_item)
    //if (victim == true ){ remove_chest_bonus(w, chest_item) }
    s.cooldown = math.random(5, 15)
  }

  s.cooldown = s.cooldown + 5
}
//testjpf player interact.gui related
export function witness_player(w: string) {
  let consequence = {
    confront: false,
    type: 'neutral',
  }

  consequence = seen_check('player', w)

  consequence = thief_consequences('player', w, consequence)

  return consequence
}
