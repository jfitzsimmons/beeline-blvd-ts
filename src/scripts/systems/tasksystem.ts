import { items } from '../systems/inventorysystem'
const { tasks, rooms, npcs, player } = globalThis.game.world
import {
  Occupants,
  Caution,
  Confront,
  Npc,
  PlayerState,
  Effect,
} from '../../types/state'
import { shuffle } from '../utils/utils'
import { fx, add_effects_bonus } from '../systems/effectsystem'

const fxLookup = {
  merits: [
    'admirer',
    'inspired',
    'eagleeye',
    'vanity',
    'readup',
    'yogi',
    'angel',
  ],
  demerits: [
    'prejudice',
    'boring',
    'distracted',
    'ignorant',
    'lazy',
    'dunce',
    'devil',
  ],
}

function admirer(s: string, w: string) {
  const effect: Effect = { ...fx.admirer }
  effect.fx.stat = npcs.all[s].clan
  npcs.all[w].effects.push(effect)
  add_effects_bonus(npcs.all[w], effect)
}
function prejudice(s: string, w: string) {
  print('QC:: prejudice')
  const effect: Effect = { ...fx.prejudice }
  effect.fx.stat = npcs.all[s].clan
  npcs.all[w].effects.push(effect)
  add_effects_bonus(npcs.all[w], effect)
}
function pledge(s: string) {
  print('QC:: pledge') //pledge not to do it again
  npcs.all[s].cooldown = npcs.all[s].cooldown + 8
}
function bribe(s: string, w: string) {
  const s_inv = npcs.all[s].inventory
  const w_inv = npcs.all[w].inventory

  if (s_inv.length > 0) {
    for (let i = s_inv.length - 1; i >= 0; i--) {
      if (items[s_inv[i]].value > 1) {
        const loot = s_inv.splice(i, 1)

        w_inv.push(...loot)
        break
      } else {
        print('bribe failed so punch???')
        // bribe failed so punch???
      }
    }
  }
}
function wPunchS(s: string) {
  npcs.all[s].hp = npcs.all[s].hp - 1
}
function go_to_jail(s: string) {
  // remove all arrests for suspect(clear record)
  print('found:', s, ' ARREST!!!!')
  tasks.remove_heat(s)
  const occupants: Occupants = rooms.all.security.occupants!
  let station: keyof typeof occupants
  for (station in occupants) {
    const prisoner = occupants[station]
    if (prisoner == '') {
      rooms.all.security.occupants![station] = s
      npcs.all[s].matrix = rooms.all.security.matrix
      npcs.all[s].cooldown = 6

      print(s, 'jailed for:', npcs.all[s].cooldown)
      break
      //testjpf if jail full, kick outside of hub
    }
  }
}
function send_to_infirmary(v: string, doc: string) {
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
      npcs.all[v].cooldown = 8
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
function player_snitch_check(b: boolean, w: string, reason: string): string {
  let caution_state = 'questioning'
  if (player.alert_level > 1) caution_state = 'arrest'
  player.alert_level =
    b == false ? player.alert_level + 1 : player.alert_level + 2
  if (player.alert_level > 2 && tasks.plan_on_snitching(w, 'player') == false) {
    tasks.caution_builder(npcs.all[w], 'snitch', 'player', reason)
  }
  return caution_state
}
function npc_snitch_check(b: boolean, w: string, s: string) {
  let caution_state = 'questioning'

  if (b == true) {
    npcs.all[w].attitudes[npcs.all[s].clan] =
      npcs.all[w].attitudes[npcs.all[s].clan] - 1
  }
  if (math.random() < 0.33) caution_state = 'arrest'
  return caution_state
}
function snitch_to_security(c: Caution, watcher: string) {
  print(c.npc, 'SNITCHED')
  const bulletin = tasks.already_hunting(watcher, c.suspect)
  let caution_state = 'questioning'

  if (bulletin == null) {
    tasks.caution_builder(npcs.all[watcher], caution_state, c.suspect, c.reason)
  } else {
    bulletin.time = bulletin.time + 6
  }

  caution_state =
    c.suspect == 'player'
      ? player_snitch_check(bulletin == null, watcher, c.reason)
      : npc_snitch_check(bulletin == null, watcher, c.suspect)
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

    const effect: Effect = fx[fx_labels[1]]
    if (effect.fx.type == 'attitudes') {
      effect.fx.stat = npcs.all[c.suspect].clan
    }
    add_effects_bonus(watcher, effect)
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
function npc_confrontation(s: string, c: Caution) {
  if (c.reason == 'questioning') {
    question_consequence(c)
  }
  if (c.reason == 'arrest') {
    print('CAUTION:: arrest.', c.npc, 'threw', s, 'in jail')
    go_to_jail(s)
  }
}
function merits_demerits(c: Caution, w: string) {
  if (c.suspect === 'player') {
    const adj = c.label === 'merits' ? 1 : -1
    npcs.all[w].love = npcs.all[w].love + adj
  }
  const fxArray = c.label === 'merits' ? fxLookup.merits : fxLookup.demerits
  const fx_labels = shuffle(fxArray)
  const effect: Effect = { ...fx[fx_labels[1]] }
  if (effect.fx.type == 'attitudes') {
    effect.fx.stat = npcs.all[c.suspect].clan
  }
  print(c.npc, 'found:', w, 'because merits.', w, 'has effect:', fx_labels[1])
  npcs.all[w].effects.push(effect)
  add_effects_bonus(npcs.all[w], effect)
}
function arraymove(arr: string[], fromIndex: number, toIndex: number) {
  const element = arr[fromIndex]
  arr.splice(fromIndex, 1)
  arr.splice(toIndex, 0, element)
}
function adjust_medic_queue(s: string) {
  if (tasks.medicQueue.includes(s) == true) {
    if (tasks.medicQueue.indexOf(s) > 1)
      arraymove(tasks.medicQueue, tasks.medicQueue.indexOf(s), 0)
  } else {
    print('cautions caused s:', s, 'to be added to medicQueue')
    tasks.medicQueue.push(s)
  }
}
function focused_acts(c: Caution) {
  if (c.reason == 'office') {
    if (c.time == 1) {
      npcs.all[c.suspect].hp = 5
      rooms.all.infirmary.occupants![npcs.all[c.suspect].currentstation] = ''
    } else {
      const aid = rooms.all.infirmary.stations.aid
      if (aid != '' && npcs.all[aid].clan == 'doctors') {
        npcs.all[c.npc].currentroom = 'infirmary'
        npcs.all[c.npc].currentstation = 'aid'
      }
    }
  } else if (c.reason == 'field') {
    if (c.time == 1) {
      send_to_infirmary(c.suspect, c.npc)
    } else {
      // testjpfsame code as ai_checks tendtopatient
      const vstation = npcs.all[c.suspect].currentstation
      const dstation = npcs.all[c.npc].currentstation
      if (npcs.all[c.npc].currentroom == player.currentroom)
        msg.post(`/${dstation}#npc_loader`, hash('move_npc'), {
          station: vstation,
          npc: c.npc,
        })
      print(c.npc, 'tending to', c.suspect, 'in the field')
    }
  }
}
function passive_acts(c: Caution, w: string) {
  if (c.label == 'reckless') {
    reckless_consequence(c, w)
  } else if (
    c.authority == 'security' &&
    c.label == 'snitch' &&
    (c.authority == npcs.all[w].clan || c.authority == npcs.all[w].labelname)
  ) {
    snitch_to_security(c, w)
  } else if (
    (c.label == 'merits' || c.label == 'demerits') &&
    (npcs.all[w].clan == c.authority ||
      npcs.all[c.npc].attitudes[npcs.all[w].clan] > 0)
  ) {
    merits_demerits(c, w)
  } else if (c.label == 'injury') {
    adjust_medic_queue(c.suspect)
  }
}
function address_confrontations(cs: Caution[]) {
  let confront: Confront | null = null

  for (let i = cs.length - 1; i >= 0; i--) {
    const c = cs[i]
    const agent = npcs.all[c.npc]
    const suspect: Npc | PlayerState =
      c.suspect === 'player' ? player.state : npcs.all[c.suspect]

    if (
      agent.currentroom == suspect.currentroom ||
      (agent.currentroom == suspect.exitroom &&
        agent.exitroom == suspect.currentroom)
    ) {
      c.suspect !== 'player' && npc_confrontation(suspect.labelname, c)
      c.time = 0
      confront =
        c.suspect == 'player'
          ? {
              npc: c.npc,
              station: '',
              state: c.label,
              reason: c.reason,
            }
          : null
    }
    if (confront != null) break
  }
  return confront
}
function address_conversations(cs: Caution[]) {
  for (let i = cs.length - 1; i >= 0; i--) {
    const agent = npcs.all[cs[i].npc]
    const stations = rooms.all[agent.currentroom].stations
    let station: keyof typeof stations
    for (station in stations) {
      const watcher = stations[station]
      //loop through stations in room of task agent
      if (watcher != '' && watcher != cs[i].npc && watcher != cs[i].suspect) {
        passive_acts(cs[i], watcher)
      }
    }
  }
}
function address_busy_acts(cs: Caution[]) {
  for (let i = cs.length - 1; i >= 0; i--) {
    focused_acts(cs[i])
  }
}

const consequenceConditions = (
  watcher: string,
  suspect: string,
  return_first = false
): string[] => {
  const { binaries: wb, skills: ws } = npcs.all[watcher]
  const { binaries: sb, skills: ss } = npcs.all[suspect]
  const initConditions: string[] = []
  if (
    wb.passive_aggressive <= sb.passive_aggressive &&
    ws.wisdom >= ss.constitution
  ) {
    initConditions.push('pledge')
    if (return_first === true) return ['pledge']
  }
  if (
    wb.lawless_lawful < -0.4 &&
    ws.strength >= ss.strength &&
    sb.passive_aggressive < 0.0
  ) {
    initConditions.push('bribe')
    if (return_first === true) return ['bribe']
  }
  if (
    ws.intelligence < 5 &&
    wb.evil_good < -0.3 &&
    ws.constitution >= ss.speed
  ) {
    initConditions.push('wPunchS')
    if (return_first === true) return ['wPunchS']
  }
  if (
    wb.anti_authority > 0.3 &&
    ws.perception >= ss.perception &&
    sb.passive_aggressive <= 0.0
  ) {
    initConditions.push('jailTime')
    if (return_first === true) return ['jailTime']
  }
  if (
    ws.charisma <= ss.charisma &&
    wb.anti_authority < -0.3 &&
    ws.perception < 5
  ) {
    initConditions.push('admirer')
    if (return_first === true) return ['admirer']
  }
  if (
    ws.wisdom < 4 &&
    sb.poor_wealthy < wb.poor_wealthy &&
    ws.charisma < ws.stealth
  ) {
    initConditions.push('prejudice')
    if (return_first === true) return ['prejudice']
  }
  if (math.random() < 0.5) {
    initConditions.push('unlucky')
    if (return_first === true) return ['unlucky']
  }
  /**   return {
    pledge:
      wb.passive_aggressive <= sb.passive_aggressive &&
      ws.wisdom >= ss.constitution,
  }**/
  return initConditions
}
const consequenceLookup = (_s: string, _w: string) => {
  return {
    pledge,
    bribe,
    wPunchS,
    jailTime: go_to_jail,
    admirer,
    prejudice,
    unlucky: go_to_jail,
  }
}

export function address_cautions() {
  const sortedCautions = tasks.cautions.sort(
    (a: Caution, b: Caution) => a.time - b.time
  )
  const { confrontational, leftovercautions } = sortedCautions.reduce(
    (r: { [key: string]: Caution[] }, o: Caution) => {
      r[
        o.label == 'questioning' || o.label == 'arrest'
          ? 'confrontational'
          : 'leftovercautions'
      ].push(o)
      return r
    },
    { confrontational: [], leftovercautions: [] }
  )
  const { medical, conversational } = leftovercautions.reduce(
    (r: { [key: string]: Caution[] }, o: Caution) => {
      r[o.label == 'mending' ? 'medical' : 'conversational'].push(o)
      return r
    },
    { medical: [], conversational: [] }
  )

  const confront: Confront | null = address_confrontations(confrontational)

  address_busy_acts(medical)
  address_conversations(conversational)

  for (let i = sortedCautions.length - 1; i >= 0; i--) {
    sortedCautions[i].time--
    if (sortedCautions[i].time <= 0) sortedCautions.splice(i, 1)
    print('OUT OF HAND ??? tasks.cautions.length', tasks.cautions.length)
    //if (confront != null) break
  }
  //testjpf could see adding more data to this return
  return confront
}
export function question_consequence(c: Caution) {
  print('QC::: ', c.npc, 'is NOW questioning:', c.suspect)
  const w = npcs.all[c.npc]
  const s = npcs.all[c.suspect]

  let consequenceResults: string[] = consequenceConditions(
    w.labelname,
    s.labelname
  )
  if (consequenceResults.length > 0) {
    if (consequenceResults.length > 1)
      consequenceResults = shuffle(consequenceResults)
    const consequenceLabel: string = consequenceResults[0]

    const consequences: { [key: string]: (s: string, w: string) => void } =
      consequenceLookup(s.labelname, w.labelname)
    consequences[consequenceLabel](s.labelname, w.labelname)
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
