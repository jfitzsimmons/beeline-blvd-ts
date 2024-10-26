/* eslint-disable @typescript-eslint/no-empty-function */
import { NpcsInitState } from './inits/npcsInitState'
import StateMachine from './stateMachine'

import { Npcs } from '../../types/state'
import { shuffle } from '../utils/utils'
import { NpcMethod, QuestMethods, RoomMethod } from '../../types/tasks'
import NpcState from './npc'

interface BinaryLookupTable {
  [key: string]: BinaryLookupRow
}
interface BinaryLookupRow {
  [key: string]: number
}
const skills = {
  constitution: 5,
  charisma: 5, // deception?
  wisdom: 5,
  intelligence: 5,
  speed: 5,
  perception: 5, // insight
  strength: 5, //carrying capacity, intimidation
  stealth: 5, // !!
}
const binaries = {
  evil_good: 0,
  passive_aggressive: 0,
  lawless_lawful: 0,
  anti_authority: 0,
  un_educated: 0,
  poor_wealthy: 0,
  mystical_logical: 0,
  noir_color: 0,
}
const binarylookup: BinaryLookupTable = {
  ais: {
    evil_good: 0.3,
    passive_aggressive: -0.3,
    lawless_lawful: 0.2,
    anti_authority: -0.2,
    un_educated: 0,
    poor_wealthy: -0.1,
    mystical_logical: 0,
    noir_color: 0,
  },
  church: {
    evil_good: 0,
    passive_aggressive: -0.1,
    lawless_lawful: 0.1,
    anti_authority: 0.2,
    un_educated: -0.3,
    poor_wealthy: 0.1,
    mystical_logical: -0.2,
    noir_color: 0,
  },
  contractors: {
    evil_good: 0.1,
    passive_aggressive: -0.1,
    lawless_lawful: 0.1,
    anti_authority: 0.1,
    un_educated: 0.3,
    poor_wealthy: 0.2,
    mystical_logical: 0.1,
    noir_color: 0,
  },
  corps: {
    evil_good: -0.3,
    passive_aggressive: 0.1,
    lawless_lawful: 0,
    anti_authority: -0.1,
    un_educated: 0.2,
    poor_wealthy: 0.3,
    mystical_logical: 0,
    noir_color: 0,
  },
  gang1: {
    evil_good: -0.2,
    passive_aggressive: 0.3,
    lawless_lawful: -0.2,
    anti_authority: 0.1,
    un_educated: -0.2,
    poor_wealthy: -0.1,
    mystical_logical: -0.1,
    noir_color: 0,
  },
  gang2: {
    evil_good: -0.2,
    passive_aggressive: 0,
    lawless_lawful: -0.1,
    anti_authority: -0.1,
    un_educated: -0.2,
    poor_wealthy: 0.2,
    mystical_logical: 0,
    noir_color: 0.1,
  },
  gang3: {
    evil_good: -0.1,
    passive_aggressive: 0.2,
    lawless_lawful: -0.3,
    anti_authority: 0.2,
    un_educated: -0.1,
    poor_wealthy: 0,
    mystical_logical: 0,
    noir_color: 0,
  },
  gang4: {
    evil_good: 0.1,
    passive_aggressive: 0.1,
    lawless_lawful: -0.1,
    anti_authority: -0.2,
    un_educated: 0.2,
    poor_wealthy: -0.2,
    mystical_logical: 0,
    noir_color: 0,
  },
  labor: {
    evil_good: 0.2,
    passive_aggressive: -0.2,
    lawless_lawful: 0.2,
    anti_authority: -0.3,
    un_educated: -0.1,
    poor_wealthy: -0.3,
    mystical_logical: 0,
    noir_color: 0,
  },
  security: {
    evil_good: -0.1,
    passive_aggressive: 0.2,
    lawless_lawful: -0.2,
    anti_authority: 0.3,
    un_educated: -0.1,
    poor_wealthy: 0.1,
    mystical_logical: 0,
    noir_color: 0,
  },
  staff: {
    evil_good: 0.2,
    passive_aggressive: 0,
    lawless_lawful: -0.2,
    anti_authority: 0,
    un_educated: 0.1,
    poor_wealthy: -0.2,
    mystical_logical: 0,
    noir_color: 0,
  },
  visitors: {
    evil_good: 0,
    passive_aggressive: 0,
    lawless_lawful: 0,
    anti_authority: 0,
    un_educated: 0,
    poor_wealthy: 0,
    mystical_logical: 0,
    noir_color: 0,
  },
  sexworkers: {
    evil_good: 0,
    passive_aggressive: 0,
    lawless_lawful: 0,
    anti_authority: -0.1,
    un_educated: -0.1,
    poor_wealthy: -0.1,
    mystical_logical: 0,
    noir_color: -0.1,
  },
  doctors: {
    evil_good: 0,
    passive_aggressive: 0,
    lawless_lawful: 0.1,
    anti_authority: 0,
    un_educated: 0.1,
    poor_wealthy: 0.1,
    mystical_logical: 0.2,
    noir_color: 0,
  },
  maintenance: {
    evil_good: 0,
    passive_aggressive: -0.1,
    lawless_lawful: 0.1,
    anti_authority: 0.1,
    un_educated: -0.1,
    poor_wealthy: -0.1,
    mystical_logical: 0.1,
    noir_color: 0,
  },
  custodians: {
    evil_good: 0.1,
    passive_aggressive: 0.1,
    lawless_lawful: -0.1,
    anti_authority: -0.1,
    un_educated: -0.2,
    poor_wealthy: -0.2,
    mystical_logical: -0.1,
    noir_color: 0,
  },
  mailroom: {
    evil_good: -0.1,
    passive_aggressive: 0.2,
    lawless_lawful: -0.2,
    anti_authority: 0.1,
    un_educated: 0,
    poor_wealthy: -0.1,
    mystical_logical: 0,
    noir_color: 0,
  },
}
const dt = math.randomseed(os.time())

// need npcs interface?
export default class WorldNpcs {
  fsm: StateMachine
  private _all: Npcs
  order: string[]
  quests: QuestMethods
  npcLists: NpcMethod
  infirmed: string[]
  injured: string[]
  ignore: string[]

  constructor(roommethods: RoomMethod) {
    //testjpf npcs need their own statemachine.
    //this._all = { ...NpcsInitState }

    this.infirmed = []
    this.injured = []
    this.ignore = []
    this.order = []
    this.quests = {
      return_doctors: this.return_doctors.bind(this),
      return_security: this.return_doctors.bind(this),
      return_all: this.return_all.bind(this),
      return_order_all: this.return_order_all.bind(this),
    }
    this.npcLists = {
      //get_player_room: roommethods.get_player_room.bind(this),
      add_infirmed: this.add_infirmed.bind(this),
      remove_infirmed: this.remove_infirmed.bind(this),
      add_injured: this.add_injured.bind(this),
      remove_injured: this.remove_injured.bind(this),
      ...roommethods,
      /** 
      getVicinityTargets: roommethods.getVicinityTargets.bind(this),
      clear_station: roommethods.clear_station.bind(this),
      set_station: roommethods.set_station.bind(this),
      prune_station_map: roommethods.prune_station_map.bind(this),
      get_station_map: roommethods.get_station_map.bind(this),
      reset_station_map: roommethods.reset_station_map.bind(this),
      */
    }
    this._all = seedNpcs(this.npcLists)
    random_attributes(this.all, this.order)
    this.inventory_init()

    this.fsm = new StateMachine(this, 'npcs')

    this.fsm.addState('idle')
    this.fsm.addState('turn', {
      onEnter: this.onTurnEnter.bind(this),
      onUpdate: this.onTurnUpdate.bind(this),
      onExit: this.onTurnExit.bind(this),
    })
    this.fsm.addState('new', {
      onEnter: this.onNewEnter.bind(this),
      onUpdate: this.onNewUpdate.bind(this),
      onExit: this.onNewExit.bind(this),
    })

    this.return_doctors = this.return_doctors.bind(this)
    this.return_security = this.return_security.bind(this)
  }

  private onNewEnter(): void {}
  private onNewUpdate(): void {
    print('npcsNewupdate')
    this.sort_npcs_by_encounter()
    for (let i = this.order.length; i-- !== 0; ) {
      const npc = this.all[this.order[i]]
      npc.fsm.setState('new')
      npc.fsm.update(dt)
    }
    this.npcLists.reset_station_map()
    this.fsm.setState('turn')
  }
  private onNewExit(): void {}
  private onTurnEnter(): void {
    print('npcsturnenter')
  }
  private onTurnUpdate(): void {
    // print('npcsturnupdate')
    this.sort_npcs_by_encounter()
    for (let i = this.order.length; i-- !== 0; ) {
      // print('npc', i)
      const npc = this.all[this.order[i]]

      npc.fsm.update(dt)
    }
    this.npcLists.reset_station_map()
  }
  private onTurnExit(): void {}

  public get all(): Npcs {
    return this._all
  }
  add_ignore(n: string): void {
    this.ignore.push(n)
  }
  remove_ignore(n: string): void {
    this.ignore.splice(this.ignore.indexOf(n), 1)
  }
  add_infirmed(n: string): void {
    this.infirmed.push(n)
  }
  remove_infirmed(n: string): void {
    this.infirmed.splice(this.infirmed.indexOf(n), 1)
  }
  add_injured(n: string): void {
    this.injured.push(n)
  }
  remove_injured(n: string): void {
    this.injured.splice(this.infirmed.indexOf(n), 1)
  }
  return_doctors(): NpcState[] {
    return [this.all.doc01, this.all.doc02, this.all.doc03]
  }
  return_security(): NpcState[] {
    return [
      this.all.security001,
      this.all.security002,
      this.all.security003,
      this.all.security004,
      this.all.security005,
    ]
  }
  return_all(): Npcs {
    return this.all
  }
  sort_npcs_by_encounter() {
    this.order.sort(
      (a: string, b: string) =>
        this.all[a].turns_since_encounter - this.all[b].turns_since_encounter
    )
  }
  return_order_all(): [string[], Npcs] {
    return [shuffle(this.order), this.all]
  }
  inventory_init() {
    let nKey: keyof typeof this.all
    for (nKey in this.all) {
      for (const item of this.all[nKey].inventory) {
        this.all[nKey].add_inventory_bonus(item)
      }
    }
  }
}

function adjust_binaries(value: number, clan: string, binary: string) {
  let adj = binarylookup[clan][binary] + value + math.random(-0.4, 0.4)
  if (adj > 1) {
    adj = 1
  } else if (adj < -1) {
    adj = -1
  }

  return adj
}

function seedNpcs(lists: NpcMethod) {
  const seeded: Npcs = {}
  //const inits = { ...NpcsInitState }
  let ki: keyof typeof NpcsInitState
  for (ki in NpcsInitState) {
    // creat npc class constructor todo now testjpf
    // seeded.push({ [ki]: new NpcState(ki) })
    seeded[ki] = new NpcState(ki, lists)
  }
  return seeded
}

function random_attributes(npcs: Npcs, order: string[]) {
  const ai_paths = ['inky', 'blinky', 'pinky', 'clyde']
  const startskills = [1, 2, 3, 5, 7, 7, 8, 8]
  const startbins = [-0.3, 0.3, -1, -0.5, -0.1, 0.1, 0.5, 1]
  let path = 0
  let count = 1

  let kn: keyof typeof npcs
  for (kn in npcs) {
    order.splice(count, 0, kn)
    npcs[kn].turns_since_encounter = math.random(5, 15)
    npcs[kn].love = math.random(-1, 1)
    // random attitude
    npcs[kn].attitudes = {}
    let kbl: keyof typeof binarylookup
    for (kbl in binarylookup) {
      npcs[kn].attitudes[kbl] = math.random(-9, 9)
    }
    if (path > 3) {
      count++
      path = 0
      if (count > 6) count = 1
    }
    npcs[kn].race = `race0${path + 1}_0${count}`
    npcs[kn].ai_path = ai_paths[path]
    path = path + 1

    // random skills
    const tempskills = shuffle(startskills)
    let s_count = 0

    npcs[kn].skills = {}
    let ks: keyof typeof skills
    for (ks in skills) {
      npcs[kn].skills[ks] = tempskills[s_count] + math.random(-1, 1)
      s_count = s_count + 1
    }

    // random binaries
    const tempbins = shuffle(startbins)
    let b_count = 0

    npcs[kn].binaries = {}
    let kb: keyof typeof binaries
    for (kb in binaries) {
      const adjustment = adjust_binaries(tempbins[b_count], npcs[kn].clan, kb)
      npcs[kn].binaries[kb] = adjustment
      b_count = b_count + 1
    }
  }
}
