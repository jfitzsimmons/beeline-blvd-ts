/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
//const world = require( "main.states.worldstate")
//const roomstates = require( "main.states.roomstates")
//const taskstates = require( "main.states.taskstates")
//const utils = require( "main.utils.utils")
const fx = require('../../../main.systems.effectsystem')
const chest = require('../../../main.systems.inventorysystem')
const { tasks, rooms, npcs, player } = globalThis.game.world
import {
  Prisoners,
  Caution,
  Confront,
  Npc,
  PlayerState,
  Effect,
} from '../../types/state'
import { shuffle } from '../utils/utils'

function go_to_jail(suspect: string) {
  //testjpf not sure if i should loop through cautions and
  // remove all arrests for suspect(clear record)
  print('found:', suspect, ' ARREST!!!!')
  tasks.remove_heat(suspect)
  const prisoners: Prisoners = rooms.all.security.prisoners!
  let station: keyof typeof prisoners
  for (station in prisoners) {
    const prisoner = prisoners[station]
    if (prisoner == '') {
      rooms.all.security.prisoners![station] = suspect
      npcs.all[suspect].matrix = rooms.all.security.matrix
      npcs.all[suspect].cooldown = 6

      print(
        suspect,
        'is in jail for:',
        npcs.all[suspect].cooldown,
        'as',
        station,
        rooms.all.security.prisoners![station]
      )
      break
      //testjpf if jail full, kick outside of hub
    }
  }
}

function snitch_to_security(c: Caution, watcher: string) {
  print(c.npc, 'SNITCHED')
  let caution_state = 'questioning'
  if (c.suspect == 'player') {
    if (player.alert_level > 1) {
      caution_state = 'arrest'
    }
    player.alert_level = player.alert_level + 1
  } else if (math.random() < 0.33) {
    caution_state = 'arrest'
  }

  const bulletin = tasks.already_hunting(watcher, c.suspect)
  if (bulletin == null) {
    tasks.caution_builder(npcs.all[watcher], caution_state, c.suspect, c.reason)
  } else {
    bulletin.time = bulletin.time + 6
    if (c.suspect == 'player') {
      player.alert_level = player.alert_level + 1
    } else {
      npcs.all[watcher].attitudes[npcs.all[c.suspect].clan] =
        npcs.all[watcher].attitudes[npcs.all[c.suspect].clan] - 1
    }
  }
  if (
    player.alert_level > 2 &&
    tasks.plan_on_snitching(watcher, c.suspect) == false
  ) {
    tasks.caution_builder(npcs.all[watcher], 'snitch', c.suspect, c.reason)
  }

  c.time = 0
}

function reckless_consequence(c: Caution, w: string) {
  print('RC::: ', c.npc, ' is gossiping with', w)
  const watcher = npcs.all[w]
  let effects_list: string[] = []

  if (
    c.reason == 'theft' &&
    watcher.binaries.evil_good > 0.5 &&
    watcher.skills.wisdom > 5
  ) {
    if (c.suspect != 'player') {
      effects_list = ['crimewave', 'inspired', 'eagleeye', 'modesty']
    } else {
      watcher.love = watcher.love - 2
    }
  } else if (
    c.reason == 'theft' &&
    watcher.binaries.lawless_lawful < -0.5 &&
    watcher.skills.intelligence < 4
  ) {
    if (c.suspect != 'player') {
      effects_list = ['admirer', 'opportunist', 'inspired', 'amped']
    } else {
      watcher.love = watcher.love + 2
    }
  } else if (
    c.reason == 'theft' &&
    watcher.binaries.un_educated < -0.5 &&
    watcher.skills.perception < 4
  ) {
    if (c.suspect != 'player') {
      effects_list = ['prejudice', 'incharge', 'boring', 'loudmouth']
    } else {
      watcher.love = watcher.love + 2
    }
  } else if (
    c.reason == 'harassing' &&
    watcher.binaries.evil_good < -0.6 &&
    watcher.binaries.passive_aggressive > 0.6
  ) {
    if (c.suspect != 'player') {
      effects_list = ['inspired', 'opportunist', 'vanity', 'inhiding']
    } else {
      watcher.love = watcher.love + 2
    }
  } else if (
    c.reason == 'harassing' &&
    watcher.binaries.un_educated > 0.4 &&
    watcher.skills.perception > 4
  ) {
    if (c.suspect != 'player') {
      effects_list = ['crimewave', 'inshape', 'readup', 'modesty']
    } else {
      watcher.love = watcher.love - 2
    }
  }
  if (effects_list.length > 0) {
    const fx_labels = shuffle(effects_list)

    const effect: Effect = fx.all[fx_labels[1]]
    //testjpf need types, maybe more
    //effect.label = fx_labels[1]
    if (effect.fx.type == 'attitudes') {
      effect.fx.stat = npcs.all[c.suspect].clan
    }
    fx.add_effects_bonus(watcher, effect)
    print(
      'RC:::',
      watcher.labelname,
      'has a new effect',
      effect.label,
      'because of gossip from',
      c.npc,
      'that',
      c.suspect,
      'was caught for',
      c.reason
    )
    npcs.all[watcher.labelname].effects.push(effect) // lawfulness increase?
  } else {
    if (c.suspect != 'player') {
      const caution = tasks.consolation_checks(watcher.binaries, watcher.skills)
      if (caution != 'neutral' && caution != 'reckless') {
        print(
          'RC:::',
          watcher.labelname,
          'has NO effect but a caution:',
          caution,
          'because of gossip from',
          c.npc,
          'that',
          c.suspect,
          'was caught for',
          c.reason
        )
        tasks.caution_builder(watcher, caution, c.suspect, c.reason)
      } else {
        print('reckless_consequence: no fx or cautions')
      }
    } else {
      watcher.love = watcher.love - 1
    }
  }
}

//testjpf maybe later abstract to security tasks? sub tasks?
// or i could see other systems using this method
export function question_consequence(c: Caution) {
  print('QC::: ', c.npc, 'is NOW questioning:', c.suspect)
  const w = npcs.all[c.npc]
  const s = npcs.all[c.suspect]

  if (
    w.binaries.passive_aggressive <= s.binaries.passive_aggressive &&
    w.skills.wisdom >= s.skills.constitution
  ) {
    print('QC:: promise') //promise not to do it again
    s.cooldown = s.cooldown + 8
  } else if (
    w.binaries.lawless_lawful < -0.4 &&
    w.skills.strength >= s.skills.strength &&
    s.binaries.passive_aggressive < 0.0
  ) {
    if (s.inventory.length > 0) {
      //testjpf need to change hashes to string in npc init state and invsystem

      for (let i = s.inventory.length - 1; i >= 0; i--) {
        if (chest.items[s.inventory[i]].value > 1) {
          const loot = s.inventory.splice(i, 1)
          print(
            'QC:: bribed.',
            w.labelname,
            'extorted',
            loot,
            'from',
            s.labelname
          )
          w.inventory.push(...loot)
          //table.insert(w.inventory,loot)
          break
        } else {
          print('bribe failed so punch???')
          // bribe failed so punch???
        }
      }
    }
    print('QC:: bribed //- if described above (else, nothing to steal)')
  } else if (
    w.skills.intelligence < 5 &&
    w.binaries.evil_good < -0.3 &&
    w.skills.constitution >= s.skills.speed
  ) {
    // watcher punches suspect
    print('QC:: w punches s')
    s.hp = s.hp - 1
  } else if (
    w.binaries.anti_authority > 0.3 &&
    w.skills.perception >= s.skills.perception &&
    s.binaries.passive_aggressive <= 0.0
  ) {
    print(
      'QC:: jailtime.',
      w.labelname,
      'threw',
      s.labelname,
      'in jail for lying while questioning'
    )
    go_to_jail(s.labelname)
  } else if (
    w.skills.charisma <= s.skills.charisma &&
    w.binaries.anti_authority < -0.3 &&
    w.skills.perception < 5
  ) {
    print('QC:: admirer')
    const effect: Effect = { ...fx.all.admirer }
    effect.fx.stat = s.clan
    table.insert(w.effects, effect)
    fx.add_effects_bonus(w, effect)
  } else if (
    w.skills.wisdom < 4 &&
    s.binaries.poor_wealthy < w.binaries.poor_wealthy &&
    w.skills.charisma < w.skills.stealth
  ) {
    print('QC:: prejudice')
    const effect: Effect = { ...fx.all.prejudice }
    effect.fx.stat = s.clan
    table.insert(w.effects, effect)
    fx.add_effects_bonus(w, effect)
  } else if (math.random() < 0.5) {
    //testjpf not sure what to do here
    //lessser sentence
    //misdemeanor??
    print(
      'QC:: UNLUCKY ARREST.',
      w.labelname,
      'threw',
      s.labelname,
      'in jail for unlucky QUESTIONING'
    )
    go_to_jail(s.labelname)
  } else {
    if (c.suspect != 'player') {
      const caution = tasks.consolation_checks(w.binaries, w.skills)
      if (caution != 'neutral') {
        tasks.caution_builder(w, caution, c.suspect, c.reason)
      } else {
        print('QUESTIONING_consequence: no fx or cautions')
      }
    } else {
      w.love = w.love - 1
    }
  }
  c.time = 0
}

export function address_cautions() {
  const cautions = tasks.cautions
  let confront: Confront | null = null
  for (let i = cautions.length - 1; i >= 0; i--) {
    //for (const c of cautions) {
    const c = cautions[i]
    confront = {
      npc: c.npc,
      station: '',
      state: c.state,
      reason: c.reason,
    }
    // print("ADDRESS CAUTIONS - c.suspect :",c.suspect)
    const agent = npcs.all[c.npc]
    let suspect: Npc | PlayerState = player.state
    if (c.suspect != 'player') {
      suspect = npcs.all[c.suspect]
    }

    // in the same room for quesitioning
    if (
      c.state == 'questioning' &&
      (agent.currentroom == suspect.currentroom ||
        (agent.currentroom == suspect.exitroom &&
          agent.exitroom == suspect.currentroom))
    ) {
      c.time = 0
      if (c.suspect == 'player') {
        print(
          c.npc,
          'has found player. QUESTIONING!!!! STATION:::',
          suspect.labelname
        )
        confront.station = suspect.labelname
      } else {
        question_consequence(c)
        confront = null
      }
      // in the same room for arrest
    } else if (
      c.state == 'arrest' &&
      (agent.currentroom == suspect.currentroom ||
        (agent.currentroom == suspect.exitroom &&
          agent.exitroom == suspect.currentroom))
    ) {
      c.time = 0
      if (c.suspect == 'player') {
        print(
          c.npc,
          'has found player. ARREST!!!! STATION:::',
          suspect.labelname
        )
        confront.station = suspect.labelname
      } else {
        print('CAUTION:: arrest.', c.npc, 'threw', c.suspect, 'in jail')
        go_to_jail(c.suspect)
        confront = null
      }
    } else {
      const stations = rooms.all[agent.currentroom].stations
      let station: keyof typeof stations // Type is "one" | "two" | "three"
      for (station in stations) {
        const watcher = stations[station]
        //loop through stations in room of task agent

        confront = null
        //is watcher present?, is caution active?
        if (
          watcher != '' &&
          c.state != 'neutral' &&
          c.time > 0 &&
          watcher != c.npc &&
          watcher != c.suspect
        ) {
          if (c.state == 'reckless') {
            reckless_consequence(c, watcher)
            // is the watcher an authority for this task
          } else if (
            c.authority == npcs.all[watcher].clan ||
            c.authority == npcs.all[watcher].labelname
          ) {
            //
            // intersting here TESTJPF
            // it might be interesting to add random npc authorities?
            // or bases on room roles??
            if (
              c.authority == 'security' &&
              c.state == 'snitch' &&
              c.npc != watcher
            ) {
              snitch_to_security(c, watcher)
            }
            // if watcher's clan is authority or clan liked by agent
          } else if (
            c.state == 'merits' &&
            c.npc != watcher &&
            (npcs.all[watcher].clan == c.authority ||
              npcs.all[c.npc].attitudes[npcs.all[watcher].clan] > 0)
          ) {
            if (c.suspect != 'player') {
              //apply possible effect to watcher
              const effects_list = [
                'admirer',
                'inspired',
                'eagleeye',
                'vanity',
                'readup',
                'yogi',
                'angel',
              ]
              const fx_labels = shuffle(effects_list)
              const effect: Effect = { ...fx.all[fx_labels[1]] }
              if (effect.fx.type == 'attitudes') {
                effect.fx.stat = npcs.all[c.suspect].clan
              }
              print(
                c.npc,
                'has found:',
                watcher,
                'because of merits caution. now',
                watcher,
                'has this effect:',
                fx_labels[1]
              )
              npcs.all[watcher].effects.push(effect)
              //table.insert(npcs.all[watcher].effects,effect)
              fx.add_effects_bonus(npcs.all[watcher], effect)
            } else {
              npcs.all[watcher].love = npcs.all[watcher].love + 1
            }
          } else if (
            c.state == 'demerits' &&
            c.npc != watcher &&
            (npcs.all[watcher].clan == c.authority ||
              npcs.all[c.npc].attitudes[npcs.all[watcher].clan] > 0)
          ) {
            if (c.suspect != 'player') {
              const effects_list = [
                'prejudice',
                'boring',
                'distracted',
                'ignorant',
                'lazy',
                'dunce',
                'devil',
              ]
              const fx_labels = shuffle(effects_list)
              const effect: Effect = { ...fx.all[fx_labels[1]] }
              if (effect.fx.type == 'attitudes') {
                effect.fx.stat = npcs.all[c.suspect].clan
              }
              print(
                c.npc,
                'has found:',
                watcher,
                'because of DEmerits caution. now',
                watcher,
                'has this effect:',
                fx_labels[1]
              )
              npcs.all[watcher].effects.push(effect)

              //table.insert(npcs.all[watcher].effects,effect)
              fx.add_effects_bonus(npcs.all[watcher], effect)
            } else {
              npcs.all[watcher].love = npcs.all[watcher].love - 1
            }
          }
        }
      }
    }
    c.time = c.time - 1
    if (c.time <= 0) cautions.splice(i, 1)
    if (confront != null) {
      break
    }
  }
  return confront
}
