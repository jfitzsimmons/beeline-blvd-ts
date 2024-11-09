/* eslint-disable @typescript-eslint/no-empty-function */
import { NpcsInitState } from './inits/npcsInitState'
import StateMachine from './stateMachine'

import { Npcs } from '../../types/state'
import { shuffle } from '../utils/utils'
import { QuestMethods } from '../../types/tasks'
import NpcState from './npc'
import { NpcProps, WorldNpcsArgs } from '../../types/world'

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
  passiveAggressive: 0,
  lawlessLawful: 0,
  anti_authority: 0,
  un_educated: 0,
  poor_wealthy: 0,
  mystical_logical: 0,
  noir_color: 0,
}
const binarylookup: BinaryLookupTable = {
  ais: {
    evil_good: 0.3,
    passiveAggressive: -0.3,
    lawlessLawful: 0.2,
    anti_authority: -0.2,
    un_educated: 0,
    poor_wealthy: -0.1,
    mystical_logical: 0,
    noir_color: 0,
  },
  church: {
    evil_good: 0,
    passiveAggressive: -0.1,
    lawlessLawful: 0.1,
    anti_authority: 0.2,
    un_educated: -0.3,
    poor_wealthy: 0.1,
    mystical_logical: -0.2,
    noir_color: 0,
  },
  contractors: {
    evil_good: 0.1,
    passiveAggressive: -0.1,
    lawlessLawful: 0.1,
    anti_authority: 0.1,
    un_educated: 0.3,
    poor_wealthy: 0.2,
    mystical_logical: 0.1,
    noir_color: 0,
  },
  corps: {
    evil_good: -0.3,
    passiveAggressive: 0.1,
    lawlessLawful: 0,
    anti_authority: -0.1,
    un_educated: 0.2,
    poor_wealthy: 0.3,
    mystical_logical: 0,
    noir_color: 0,
  },
  gang1: {
    evil_good: -0.2,
    passiveAggressive: 0.3,
    lawlessLawful: -0.2,
    anti_authority: 0.1,
    un_educated: -0.2,
    poor_wealthy: -0.1,
    mystical_logical: -0.1,
    noir_color: 0,
  },
  gang2: {
    evil_good: -0.2,
    passiveAggressive: 0,
    lawlessLawful: -0.1,
    anti_authority: -0.1,
    un_educated: -0.2,
    poor_wealthy: 0.2,
    mystical_logical: 0,
    noir_color: 0.1,
  },
  gang3: {
    evil_good: -0.1,
    passiveAggressive: 0.2,
    lawlessLawful: -0.3,
    anti_authority: 0.2,
    un_educated: -0.1,
    poor_wealthy: 0,
    mystical_logical: 0,
    noir_color: 0,
  },
  gang4: {
    evil_good: 0.1,
    passiveAggressive: 0.1,
    lawlessLawful: -0.1,
    anti_authority: -0.2,
    un_educated: 0.2,
    poor_wealthy: -0.2,
    mystical_logical: 0,
    noir_color: 0,
  },
  labor: {
    evil_good: 0.2,
    passiveAggressive: -0.2,
    lawlessLawful: 0.2,
    anti_authority: -0.3,
    un_educated: -0.1,
    poor_wealthy: -0.3,
    mystical_logical: 0,
    noir_color: 0,
  },
  security: {
    evil_good: -0.1,
    passiveAggressive: 0.2,
    lawlessLawful: -0.2,
    anti_authority: 0.3,
    un_educated: -0.1,
    poor_wealthy: 0.1,
    mystical_logical: 0,
    noir_color: 0,
  },
  staff: {
    evil_good: 0.2,
    passiveAggressive: 0,
    lawlessLawful: -0.2,
    anti_authority: 0,
    un_educated: 0.1,
    poor_wealthy: -0.2,
    mystical_logical: 0,
    noir_color: 0,
  },
  visitors: {
    evil_good: 0,
    passiveAggressive: 0,
    lawlessLawful: 0,
    anti_authority: 0,
    un_educated: 0,
    poor_wealthy: 0,
    mystical_logical: 0,
    noir_color: 0,
  },
  sexworkers: {
    evil_good: 0,
    passiveAggressive: 0,
    lawlessLawful: 0,
    anti_authority: -0.1,
    un_educated: -0.1,
    poor_wealthy: -0.1,
    mystical_logical: 0,
    noir_color: -0.1,
  },
  doctors: {
    evil_good: 0,
    passiveAggressive: 0,
    lawlessLawful: 0.1,
    anti_authority: 0,
    un_educated: 0.1,
    poor_wealthy: 0.1,
    mystical_logical: 0.2,
    noir_color: 0,
  },
  maintenance: {
    evil_good: 0,
    passiveAggressive: -0.1,
    lawlessLawful: 0.1,
    anti_authority: 0.1,
    un_educated: -0.1,
    poor_wealthy: -0.1,
    mystical_logical: 0.1,
    noir_color: 0,
  },
  custodians: {
    evil_good: 0.1,
    passiveAggressive: 0.1,
    lawlessLawful: -0.1,
    anti_authority: -0.1,
    un_educated: -0.2,
    poor_wealthy: -0.2,
    mystical_logical: -0.1,
    noir_color: 0,
  },
  mailroom: {
    evil_good: -0.1,
    passiveAggressive: 0.2,
    lawlessLawful: -0.2,
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
  parent: NpcProps
  infirmed: string[]
  injured: string[]
  ignore: string[]

  constructor(roommethods: WorldNpcsArgs) {
    //testjpf npcs need their own statemachine.
    //this._all = { ...NpcsInitState }

    this.infirmed = []
    this.injured = []
    this.ignore = []
    this.order = []
    this.quests = {
      returnDoctors: this.returnDoctors.bind(this),
      returnSecurity: this.returnDoctors.bind(this),
      returnAll: this.returnAll.bind(this),
      returnOrderAll: this.returnOrderAll.bind(this),
    }
    this.parent = {
      //getPlayerRoom: roommethods.getPlayerRoom.bind(this),
      addInfirmed: this.addInfirmed.bind(this),
      getInfirmed: this.getInfirmed.bind(this),
      getInjured: this.getInjured.bind(this),
      removeInfirmed: this.removeInfirmed.bind(this),
      addInjured: this.addInjured.bind(this),
      removeInjured: this.removeInjured.bind(this),
      addIgnore: this.addIgnore.bind(this),
      removeIgnore: this.removeIgnore.bind(this),
      ...roommethods,
      returnMendeeLocation: this.returnMendeeLocation.bind(this),
      returnDoctors: this.returnDoctors.bind(this),
      returnSecurity: this.returnDoctors.bind(this),
      returnAll: this.returnAll.bind(this),
      returnOrderAll: this.returnOrderAll.bind(this),
    }
    this._all = seedNpcs(this.parent)
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

    this.returnDoctors = this.returnDoctors.bind(this)
    this.returnSecurity = this.returnSecurity.bind(this)
  }

  private onNewEnter(): void {
    print('npcsNewupdate')
    this.sort_npcs_by_encounter()
    for (let i = this.order.length; i-- !== 0; ) {
      const npc = this.all[this.order[i]]
      npc.fsm.setState('new')
      // npc.fsm.update(dt)
    }
    //this.parent.resetStationMap()
    this.fsm.setState('turn')
  }
  private onNewUpdate(): void {}
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
    //this.parent.resetStationMap()
    this.medical()
    //this.security()

    //this.aiChecks()
  }
  private onTurnExit(): void {}

  public get all(): Npcs {
    return this._all
  }
  returnMendeeLocation() {
    return this.all[this.parent.getMendingQueue()[0]].currRoom
  }
  //security() {}
  medical() {
    let count = this.infirmed.length

    //const count = this.parent.getMendingQueue().length
    for (const doc of this.returnDoctors()) {
      const mobile = !['mender', 'mendee', 'injury', 'infirm'].includes(
        doc.fsm.getState()
      )
      print('mobilemobilemobile', mobile)
      //testjpf todo unhardcode
      //have a const that lists immobile states.!!!
      if (mobile === true && count > 0) {
        doc.fsm.setState('erfull')
        count = 0
      } else if (
        mobile === true &&
        count < 1 &&
        this.parent.getMendingQueue().length > 0
      ) {
        doc.fsm.setState('paramedic')
      } else if (mobile === true) {
        doc.fsm.setState('turn')
      }
    }
  }
  addIgnore(n: string): void {
    this.ignore.push(n)
  }
  removeIgnore(n: string): void {
    this.ignore.splice(this.ignore.indexOf(n), 1)
  }
  addInfirmed(n: string): void {
    this.infirmed.push(n)
  }
  getInfirmed(): string[] {
    return this.infirmed
  }
  removeInfirmed(n: string): void {
    this.infirmed.splice(this.infirmed.indexOf(n), 1)
  }
  addInjured(n: string): void {
    this.injured.push(n)
  }
  getInjured(): string[] {
    return this.injured
  }
  removeInjured(n: string): void {
    this.injured.splice(this.injured.indexOf(n), 1)
  }
  returnDoctors(): NpcState[] {
    return [this.all.doc01, this.all.doc02, this.all.doc03]
  }
  returnSecurity(): NpcState[] {
    return [
      this.all.security001,
      this.all.security002,
      this.all.security003,
      this.all.security004,
      this.all.security005,
    ]
  }
  returnAll(): Npcs {
    return this.all
  }
  sort_npcs_by_encounter() {
    this.order.sort(
      (a: string, b: string) =>
        this.all[a].turns_since_encounter - this.all[b].turns_since_encounter
    )
  }
  returnOrderAll(): [string[], Npcs] {
    return [shuffle(this.order), this.all]
  }
  inventory_init() {
    let nKey: keyof typeof this.all
    for (nKey in this.all) {
      for (const item of this.all[nKey].inventory) {
        this.all[nKey].addInvBonus(item)
      }
    }
  }
  /** 
  aidChecks() {
    for (const i of this.injured.filter(
      (n): n is string => !this.ignore.includes(n)
    )) {
      //externalaidcheck(i)
    }
  }*/
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

function seedNpcs(lists: NpcProps) {
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
    npcs[kn].traits.opinion = {}
    let kbl: keyof typeof binarylookup
    for (kbl in binarylookup) {
      npcs[kn].traits.opinion[kbl] = math.random(-9, 9)
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

    npcs[kn].traits.skills = {}
    let ks: keyof typeof skills
    for (ks in skills) {
      npcs[kn].traits.skills[ks] = tempskills[s_count] + math.random(-1, 1)
      s_count = s_count + 1
    }

    // random binaries
    const tempbins = shuffle(startbins)
    let b_count = 0

    npcs[kn].traits.binaries = {}
    let kb: keyof typeof binaries
    for (kb in binaries) {
      const adjustment = adjust_binaries(tempbins[b_count], npcs[kn].clan, kb)
      npcs[kn].traits.binaries[kb] = adjustment
      b_count = b_count + 1
    }
  }
}
