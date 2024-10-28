import { Actor, Npc } from '../../types/state'
import { clamp } from '../utils/utils'
const { tasks, npcs, rooms, player } = globalThis.game.world
import {
  remove_advantageous,
  remove_valuable,
  remove_last,
  remove_random,
} from '../systems/inventorysystem'
import { confrontation_consequence } from '../systems/tasksystem'
//import { injured_npcs } from '../systems/emergencysystem'
import { roll_special_dice } from '../utils/dice'
import NpcState from '../states/npc'

function tend_to_patient(p: string, doc: string) {
  npcs.all[doc].fsm.setState('mender')
  npcs.all[p].fsm.setState('mendee')
  tasks.remove_heat(p)
  tasks.task_builder(npcs.all[doc], 'mender', p, 'injury')
  tasks.mendingQueue.splice(tasks.mendingQueue.indexOf(p), 1)

  if (npcs.all[doc].currentroom == player.currentroom)
    msg.post(`/${npcs.all[doc].currentstation}#npc_loader`, hash('move_npc'), {
      station: npcs.all[p].currentstation,
      npc: doc,
    })
}

export function aid_check() {
  /**
   * loop thru injured, see whos in the room.
   * if not a doctor add an injury task??
   * if doctor set state to mending move station to patient via message.
   */

  //testjpf
  // we combined those 2 confusing arrays
  //const allInjured = [...tasks.mendingQueue, ...npcs.injured]

  for (const i of npcs.injured.filter(
    (n): n is string => !npcs.ignore.includes(n)
  )) {
    print('Needsadoc!:::', i)
    const stations = rooms.all[npcs.all[i].currentroom].stations
    let sKey: keyof typeof stations
    for (sKey in stations) {
      const helper = stations[sKey]
      //check each station for a chance for them to help injured
      if (helper != '' && helper != i) {
        //doctors start mending after RNG weighted by patient priority
        const ticket = tasks.mendingQueue.indexOf(i)
        if (
          npcs.all[helper].clan == 'doctors' &&
          ((ticket != -1 && ticket < math.random(0, 5)) ||
            (ticket == -1 && math.random() > 0.2))
        ) {
          tend_to_patient(i, helper)
          break
        } else if (
          math.random() > 0.36 &&
          tasks.npc_has_task(helper, i) == null &&
          tasks.has_ignore_task(i) == false
        ) {
          //if not a doctor, create injury caution if haven't already
          tasks.task_builder(npcs.all[helper], 'injury', i, 'injury')
          break
        }
      }
    }
  }
}
export function take_check(taker: NpcState, actor: Npc | Actor) {
  let modifier = Math.round(
    taker.skills.stealth -
      taker.skills.charisma +
      taker.binaries.passive_aggressive * -5
  )
  if (tasks.npc_has_task('any', taker.labelname) != null) {
    modifier = modifier - 1
  }
  const advantage =
    taker.binaries.poor_wealthy + taker.binaries.anti_authority * -1 > 0
  const result = roll_special_dice(5, advantage, 3, 2) + clamp(modifier, -2, 2)
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
  taker.add_inventory_bonus(chest_item)
}
export function stash_check(stasher: NpcState, actor: NpcState | Actor) {
  let modifier = stasher.inventory.length - actor.inventory.length

  if (tasks.npc_has_task('any', stasher.labelname) != null) {
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
  stasher.remove_inventory_bonus(chest_item)
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
  const seen = result <= bossResult
  return seen === true
    ? { confront: false, type: 'seen' }
    : { confront: false, type: 'neutral' }
}
export function clearance_checks(room = player.currentroom) {
  if (player.clearance >= rooms.all[room].clearance) return
  const stations = rooms.all[room].stations
  let sKey: keyof typeof stations
  for (sKey in stations) {
    const watcher = stations[sKey]
    if (watcher !== '' && npcs.all[watcher].clan == 'security') {
      //testjpf needs a diceroll and create / return confrontation
      if (confrontation_check('player', watcher) == true) {
        tasks.task_builder(
          npcs.all[watcher],
          'questioning',
          'player',
          'clearance'
        )
      }
    }
  }
}
export function confrontation_check(pname: string, nname: string) {
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
    c.type = confrontation_consequence(s, w, c.confront)
  }

  if (c.confront == false && c.type != 'neutral') {
    tasks.task_builder(npcs.all[w], c.type, s, 'theft')
  }
  return c
}
// only being used between npcs (just tutorial luggage)
export function steal_check(s: NpcState, w: Npc, loot: string[]) {
  // accept strings not Npcs
  // const attempt = roll_Specia_dice
  if (s.cooldown > 0) return

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
    consequence = thief_consequences(s.labelname, w.labelname, consequence)
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

    s.add_inventory_bonus(chest_item)
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
