import { Actor, Effect, Npc } from '../../types/state'
import { dice_roll } from '../utils/utils'
const { tasks, npcs, rooms, player } = globalThis.game.world
import {
  remove_advantageous,
  remove_valuable,
  remove_last,
  remove_random,
  add_chest_bonus,
  remove_chest_bonus,
} from '../systems/inventorysystem'
import { fx, add_effects_bonus } from '../systems/effectsystem'
import { thief_consolation_checks } from '../systems/tasksystem'
import { roll_special_dice } from '../utils/dice'

function confrontation_consequence(p: Npc, n: Npc) {
  //used for non novel dialog choices(npcs on npcs)
  //rename FUNCTION!!
  //start here, to easy to pass?
  // probably shuffle functions, each will a dice roll
  //ugly code. testjpf.  not many cautions needed.
  //returns are superflous
  print('AI_CHECKS::: confrontation consequence::: UGLY CODE TESTJPF START')
  if (
    n.binaries.passive_aggressive > 0.0 &&
    n.skills.wisdom < 5 &&
    n.skills.strength >= p.skills.speed
  ) {
    print('CC:: n punches p') //n punches p
    p.hp = p.hp - 1
    return 'nothing'
  } else if (
    p.skills.charisma > 5 &&
    n.skills.intelligence < 5 &&
    p.binaries.evil_good < -0.2
  ) {
    // makes next person n meets like p's clan
    print('CC:: vanity')
    const effect: Effect = { ...fx.vanity }
    n.effects.push(effect) // lawfulness increase?
    add_effects_bonus(n, effect)
    return 'nothing'
  } else if (
    p.skills.wisdom > 6 &&
    n.skills.wisdom > 5 &&
    p.binaries.evil_good + n.binaries.evil_good > 0.3
  ) {
    // makes next person n meets like their clan
    print('CC:: angel')
    const effect: Effect = { ...fx.angel }
    n.effects.push(effect) // lawfulness increase?
    add_effects_bonus(n, effect)
    return 'nothing'
  } else if (
    p.binaries.passive_aggressive > 0.5 &&
    p.skills.wisdom < 4 &&
    p.skills.strength >= n.skills.speed
  ) {
    // p punches n
    print('CC:: p punches n')
    n.hp = n.hp - 1
    //testjpf this should rais && ASSAULT caution!!
    return 'nothing'
  } else if (
    p.skills.charisma < 5 &&
    n.skills.perception > 5 &&
    n.binaries.passive_aggressive < -0.2
  ) {
    // makes next person n meets hate p's clan
    print('CC:: prejudice')
    const effect: Effect = { ...fx.prejudice }
    effect.fx.stat = p.clan
    n.effects.push(effect) // lawfulness increase?
    add_effects_bonus(n, effect)
    return 'nothing'
  } else if (
    p.binaries.anti_authority > 0 &&
    n.skills.stealth > 3 &&
    n.binaries.lawless_lawful > 0.2
  ) {
    print('CC:: snitch')
    // snitch
    // makes next person n meets hate p's clan
    return 'snitch'
  } else if (math.random() < 0.5) {
    print('CC:: unlucky???')
    return 'nothing'
  }

  if (p.labelname != 'adam') {
    const caution = thief_consolation_checks(n.labelname)
    if (caution != 'neutral') {
      tasks.caution_builder(n, caution, p.labelname, 'theft')
      print(
        'CONFRONTATION_consequence: stole item, confronted, keeps item, recieved caution:',
        caution
      )
    } else {
      print('CONFRONTATION_consequence: no fx or cautions')
    }
  } else {
    n.love = n.love - 1
  }

  return 'neutral'
}
function tend_to_patient(v: string, doc: string) {
  print('tending to patient', doc, v)
  tasks.medicQueue.splice(tasks.medicQueue.indexOf(v), 1)
  tasks.remove_heat(v)
  const vstation = npcs.all[v].currentstation
  const dstation = npcs.all[doc].currentstation
  //npcs.all[doc].cooldown = 8
  if (npcs.all[doc].currentroom == player.currentroom)
    msg.post(`/${dstation}#npc_loader`, hash('move_npc'), {
      station: vstation,
      npc: doc,
    })
  tasks.caution_builder(npcs.all[doc], 'mending', v, 'field')
  // testjpf need a CAUTION!!!??
  // c.label = mending
  //go.set_position()
  //send_to_infirmary(i)
}

export function aid_check(injured: string[]) {
  /**
   * tesrtjpf so when caution created
   * removed form injured[]
   * added to tasks.mediQ
   * best thing would be to split these into 2 loops. one for each array.
   */
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

          // send_to_infirmary(i)
          //testjpf move victim to infirmary bed
          //clear cautions
          //restore hp
          //give cooldown
        } else {
          if (math.random() > 0.9 && tasks.npc_has_caution(helper, i) == null) {
            tasks.caution_builder(npcs.all[helper], 'injury', i, 'injury')
            print('injury caution created for', i, ' | HEL{ER::', helper)
            break
          }
        }
      }
    }
    //for every station in "i" current room
    //if not empty and != "i"
    //then chance to get help or other consequence
    //print(i)
  }
}
export function take_check(taker: Npc, actor: Npc | Actor) {
  // testjpf if you hae a cooldown, it greatly increases your chances??
  // ){ make default chance lower
  let chances =
    math.random() + (1 - taker.inventory.length - taker.cooldown) * 0.1
  if (tasks.npc_has_caution('any', taker.labelname) != null) {
    chances = chances - 0.1
  }

  const minmax = dice_roll()

  let take = false

  if (chances > 0.5) {
    // advantage
    if (
      minmax[0] * 10 <
      (taker.skills.speed +
        taker.skills.stealth +
        taker.binaries.poor_wealthy * -10) /
        9
    ) {
      take = true
    }
    //disadvantage
    else if (
      minmax[1] * 10 <
      (taker.skills.speed +
        taker.skills.stealth +
        taker.binaries.poor_wealthy * -10) /
        9
    ) {
      take = true
    }
  }

  if (take == true) {
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
  } else {
    print(taker.labelname, 'failed to Take')
  }
}
export function stash_check(stasher: Npc, actor: Npc | Actor) {
  let chances =
    math.random() +
    (stasher.inventory.length - 2) * 0.1 +
    (stasher.cooldown / 2) * 0.1
  if (tasks.npc_has_caution('any', stasher.labelname) != null) {
    chances = chances + 0.1
  }

  const minmax = dice_roll()
  let stash = false
  if (chances > 0.5) {
    // advantage
    if (
      minmax[0] * 10 <
      (stasher.skills.constitution +
        stasher.skills.stealth +
        stasher.binaries.anti_authority * -10) /
        5
    ) {
      stash = true
    }
    //disadvantage
    else if (
      minmax[1] * 10 <
      (stasher.skills.constitution +
        stasher.skills.stealth +
        stasher.binaries.anti_authority * -10) /
        5
    ) {
      stash = true
    }
  }

  if (stash == true) {
    let chest_item: string | null = null
    // testjpf would need watcher for victim && more checks
    // const victim = has_value(w.inventory, a[1])
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
  } else {
    print(stasher.labelname, 'failed to stash')
  }
}
export function take_or_stash(attendant: Npc, actor: Npc | Actor) {
  if (actor.inventory.length > 0 && math.random() < 0.5) {
    take_check(attendant, actor)
  } else if (attendant.inventory.length > 0 && math.random() < 0.66) {
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
      sus.binaries.lawless_lawful * 10 -
      wchr.skills.stealth -
      wchr.skills.perception -
      heat
  )
  const advantage =
    sus.skills.speed - wchr.binaries.lawless_lawful * 10 >
    wchr.skills.speed +
      wchr.skills.constitution +
      wchr.binaries.passive_aggressive * 10

  const result =
    roll_special_dice(5, advantage, 3, 2) + (modifier > -4 ? modifier : -4)

  print('SEEN CHECK:: RESULT: DICE ROLL::', result)
  if (result > 10) return { confront: false, type: 'special' }
  if (result < 0) return { confront: true, type: 'concern' }
  const bossResult = roll_special_dice(7, true, 3, 2)
  print('SEEN CHECK:: bossResult: DICE ROLL::', bossResult)

  const seen = result < bossResult
  return seen === true
    ? { confront: false, type: 'seen' }
    : { confront: false, type: 'neutral' }
}
export function confrontation_check(pname: string, nname: string) {
  // testjpf for debugging you could check if player return false
  //if (p.labelname == 'adam') return false
  const p = pname == 'player' ? player.state : npcs.all[pname]
  const n = npcs.all[nname]

  const minmax = dice_roll()
  if (
    n.binaries.passive_aggressive > -0.9 ||
    n.binaries.lawless_lawful > -0.8
  ) {
    // p slower || NPC willing p is caught
    if (
      p.skills.speed < n.skills.speed + 2 ||
      p.skills.speed < n.skills.constitution + 3
    ) {
      // check for confrontation with DISADVANTAGE
      if (minmax[0] * 9 < (n.skills.speed + n.skills.constitution) / 1.8) {
        print('Caught: too slow')
        return true
      }
      // check for confrontation with ADVANTAGE
      else if (minmax[1] * 10 < (n.skills.speed + n.skills.constitution) / 2) {
        print('Caught: fast, but unlucky')
        return true
      }
    }
  }
  print(n.labelname, 'did not confront: ', p.labelname)
  return false
}
export function thief_consequences(
  s: string,
  w: string,
  c: { confront: boolean; type: string }
) {
  if (npcs.all[w] != null && c.type == 'seen') {
    if (c.confront == true || confrontation_check(s, w) == true) {
      //npc gets the following.  Player gets dialog options
      if (s == 'player') {
        c.confront = true
        c.type = 'concern'
      } else {
        c.type = confrontation_consequence(npcs.all[s], npcs.all[w])
      }
    } else {
      c.type = thief_consolation_checks(w)
    }
  }

  if (c.confront == false && c.type != 'neutral') {
    tasks.caution_builder(npcs.all[w], c.type, s, 'theft')
  }
  return c
}
//testjpf only being used between npcs (just tutorial luggage)
export function steal_check(n: Npc, w: Npc, loot: string[]) {
  if (
    (n.cooldown <= 0 && n.binaries.un_educated < -0.3 && n.skills.speed > 3) ||
    (n.binaries.lawless_lawful < 0.5 && n.skills.stealth > 2) ||
    (n.binaries.evil_good < -0.3 &&
      n.love < -4 &&
      n.binaries.poor_wealthy < -0.3 &&
      n.skills.stealth > 3) ||
    (n.skills.perception < 5 && n.skills.constitution < 5) ||
    (n.skills.speed > 4 && w != null && n.attitudes[w.clan] < -1) ||
    math.random() < 0.2
  ) {
    let consequence = {
      confront: true,
      type: 'neutral',
    }
    if (w != null) {
      consequence = seen_check(n.labelname, w.labelname)
      print('SEEN CHECK CONSEQUNCE::', consequence.type)
      consequence = thief_consequences(n.labelname, w.labelname, consequence)
      print('THIEF CONSEQUNCE::', consequence.type)
    }
    //consequence = confront.type

    if (consequence.type == 'neutral') {
      let chest_item = null
      //const victim = false
      //if w != null ){ utils.has_value(w.inventory, a[1]) }

      if (math.random() < 0.4) {
        chest_item = remove_random(n.inventory, loot)
      } else if (math.random() < 0.5) {
        chest_item = remove_valuable(n.inventory, loot)
      } else {
        chest_item = remove_advantageous(n.inventory, loot, n.skills)
      }
      print(
        n.labelname,
        'in room',
        n.currentroom,
        'stole following item:',
        chest_item
      )
      add_chest_bonus(n, chest_item)
      //if (victim == true ){ remove_chest_bonus(w, chest_item) }
      n.cooldown = math.random(5, 15)
    }

    n.cooldown = n.cooldown + 5
  } else {
    // print('No attempt by', n.labelname)
  }
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
