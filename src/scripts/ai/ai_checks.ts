/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import {
  Actor,
  Effect,
  Npc,
  Occupants,
  PlayerState,
  Skills,
} from '../../types/state'
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

export function send_to_infirmary(v: string, doc: string) {
  // remove all arrests for suspect(clear record)
  print('infirmed:', v, ' :::!!!!')
  // tasks.remove_heat(v)
  const occupants: Occupants = rooms.all.infirmary.occupants!
  let station: keyof typeof occupants
  for (station in occupants) {
    const patient = occupants[station]
    if (patient == '') {
      rooms.all.infirmary.occupants![station] = v
      npcs.all[v].matrix = rooms.all.infirmary.matrix
      npcs.all[v].cooldown = 6
      npcs.all[v].currentroom = 'infirmary'
      npcs.all[v].currentstation = station
      print(v, 'infirmed for:', npcs.all[v].cooldown)
      tasks.caution_builder(npcs.all[doc], 'mending', v, 'office')
      break
    }

    //create caution mending, reason: office
    // keep doc in aid position until caution wears off
    // if a doc isnt already in aid position.
    //patients heal faster when doc is in position.
  }
  //TESTJPF
  //ideally this would finish before stations are atempted to be filled.!!!
}
function tend_to_patient(v: string, doc: string) {
  print('tend to patient', doc, v)
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
  for (const i of injured) {
    const stations = rooms.all[npcs.all[i].currentroom].stations
    let sKey: keyof typeof stations
    for (sKey in stations) {
      const helper = stations[sKey]
      print('AID CHECK:: HELPER:', helper)
      //testjpf this conditional needs more logic to it.
      if (
        helper != '' &&
        helper != i &&
        math.random() < 0.6 &&
        tasks.npc_has_caution(helper, i) == null
      ) {
        if (
          npcs.all[helper].clan == 'doctors' &&
          tasks.medicQueue.indexOf(i) < math.random(0, 9)
        ) {
          print('Medic helped victim')

          tend_to_patient(i, helper)

          // send_to_infirmary(i)
          //testjpf move victim to infirmary bed
          //clear cautions
          //restore hp
          //give cooldown
        } else {
          print('injury caution created for', i, ' | HEL{ER::', helper)
          tasks.caution_builder(npcs.all[helper], 'injury', i, 'injury')
        }
        break
      }
    }
    //for every station in "i" current room
    //if not empty and != "i"
    //then chance to get help or other consequence
    //print(i)
  }
}
function confrontation_consequence(p: Npc, n: Npc) {
  //ugly code. testjpf.  not many cautions needed.
  //returns are superflous
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
    const caution = tasks.consolation_checks(n.binaries, n.skills)
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
      print('take adv')
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
      print('take DISadv')
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
      print('stash adv')
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
      print('stash DISadv')
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
    print('check.utils Remove bonus:: chestitem:', chest_item)
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

export function seen_check(p: Skills, n: Skills) {
  const minmax = dice_roll()
  //testjpf these are high odds you'll be seen
  // as inteded???
  if (p.stealth <= n.stealth || p.stealth <= n.perception) {
    if (minmax[0] * 10 < (n.perception + n.stealth + n.speed) / 2) {
      return true
    } else if (minmax[1] * 10 < (n.perception + n.stealth + n.speed) / 2) {
      return true
    }
  }

  return false
}

export function confrontation_check(p: Npc | PlayerState, n: Npc) {
  // testjpf for debugging you could check if player return false
  if (p.labelname == 'adam') {
    return false
  }
  const minmax = dice_roll()
  if (
    n.binaries.passive_aggressive > -0.4 ||
    n.binaries.lawless_lawful > -0.4
  ) {
    // p slower || NPC willing p is caught
    if (
      p.skills.speed < n.skills.speed ||
      p.skills.speed < n.skills.constitution
    ) {
      // check for confrontation with DISADVANTAGE
      if (minmax[0] * 9 < (n.skills.speed + n.skills.constitution) / 1.6) {
        print('Caught: too slow')
        return true
      }
      // check for confrontation with ADVANTAGE
      else if (
        minmax[1] * 10 <
        (n.skills.speed + n.skills.constitution) / 1.8
      ) {
        print('Caught: fast, but unlucky')
        return true
      }
    }
  }
  print(n.labelname, 'did not confront: ', p.labelname)
  return false
}

//testjpf only being used between npcs (just tutorial luggage)
export function steal_check(n: Npc, w: Npc, loot: string[]) {
  let consequence = 'neutral'

  if (
    (n.cooldown <= 0 && n.binaries.un_educated < -0.5 && n.skills.speed > 4) ||
    (n.binaries.lawless_lawful < 0.5 && n.skills.stealth > 2) ||
    (n.binaries.evil_good < -0.5 &&
      n.love < -5 &&
      n.binaries.poor_wealthy < -0.5 &&
      n.skills.stealth > 4) ||
    (n.skills.perception < 4 && n.skills.constitution < 4) ||
    (n.skills.speed > 6 && w != null && n.attitudes[w.clan] < -3)
  ) {
    if (w != null && seen_check(n.skills, w.skills) == true) {
      print(
        'steal attempt -',
        n.labelname,
        ' SEEN by:',
        w.labelname,
        'in',
        w.currentroom
      )
      if (confrontation_check(n, w) == true) {
        consequence = confrontation_consequence(n, w)
      } else {
        consequence = tasks.consolation_checks(w.binaries, w.skills)
      }
    } else {
      if (math.random() < 0.6) {
        consequence = 'nothing'
        if (w != null) {
          print(
            'steal attempt -',
            n.labelname,
            'was UNSEEN but FAILED by:',
            w.labelname,
            'in',
            w.currentroom
          )
        } else {
          print(
            'steal attempt -',
            n.labelname,
            'was UNSEEN but FAILED no WATCHER',
            n.currentroom
          )
        }
      } else {
        if (w != null) {
          print(
            'STEAL attempt PASS-',
            n.labelname,
            'was UNSEEN by:',
            w.labelname,
            'in',
            w.currentroom
          )
        } else {
          print(
            'STEAL attempt PASS-',
            n.labelname,
            'was UNSEEN no WATCHER',
            n.currentroom
          )
        }
      }
    }

    if (consequence == 'neutral') {
      let chest_item = null
      //const victim = false
      //if w != null ){ utils.has_value(w.inventory, a[1]) }

      if (math.random() < 0.5) {
        chest_item = remove_random(n.inventory, loot)
      } else if (math.random() < 0.51) {
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
    } else if (consequence != 'nothing') {
      if (w != null) {
        tasks.caution_builder(w, consequence, n.labelname, 'theft')
      } else
        print('UNSEEN FAIL??? NO ATTEMPT??? CC:: ALL NOTHINGS???', ' TESTJPF')
    }

    n.cooldown = n.cooldown + 8
  } else {
    print('No attempt by', n.labelname)
  }
}
