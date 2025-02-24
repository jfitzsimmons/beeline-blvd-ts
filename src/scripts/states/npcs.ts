/* eslint-disable @typescript-eslint/no-empty-function */
import {
  NpcsInitState,
  seedBinaries,
  seedSkills,
  binaryLookup,
} from './inits/npcsInitState'
import NpcState from './npc'
import StateMachine from './stateMachine'
import { Npcs } from '../../types/state'
import { QuestMethods } from '../../types/tasks'
import { NpcProps, WorldNpcsArgs } from '../../types/world'
import { shuffle } from '../utils/utils'
import { RoomsInitState } from './inits/roomsInitState'
import { confrontation_check } from './inits/checksFuncs'
import { immobile } from '../utils/consts'
import PlaceSequence from '../behaviors/sequences/placeSequence'
import Selector from '../behaviors/selector'
//import InjuredSequence from '../behaviors/sequences/injuredSequence'
import InjuryAction from '../behaviors/actions/injuryAction'
import InjuredSequence from '../behaviors/sequences/injuredSequence'

const dt = math.randomseed(os.time())

export default class WorldNpcs {
  fsm: StateMachine
  private _all: Npcs
  order: string[]
  quests: QuestMethods
  parent: NpcProps
  infirmed: string[]
  injured: string[]
  ignore: string[]

  constructor(npcsProps: WorldNpcsArgs) {
    this.infirmed = [] // move to room? infrimed action?
    this.injured = [] // room? injured action?
    this.ignore = []
    this.order = []
    this.quests = {
      returnDoctors: this.returnDoctors.bind(this),
      returnSecurity: this.returnDoctors.bind(this),
      returnAll: this.returnAll.bind(this),
      returnOrderAll: this.returnOrderAll.bind(this),
    }
    this.parent = {
      addInfirmed: this.addInfirmed.bind(this),
      getInfirmed: this.getInfirmed.bind(this),
      getInjured: this.getInjured.bind(this),
      getIgnore: this.getIgnore.bind(this),
      removeInfirmed: this.removeInfirmed.bind(this),
      addInjured: this.addInjured.bind(this),
      removeInjured: this.removeInjured.bind(this),
      addIgnore: this.addIgnore.bind(this),
      removeIgnore: this.removeIgnore.bind(this),
      returnMendeeLocation: this.returnMendeeLocation.bind(this),
      returnDoctors: this.returnDoctors.bind(this),
      returnSecurity: this.returnDoctors.bind(this),
      returnAll: this.returnAll.bind(this),
      returnOrderAll: this.returnOrderAll.bind(this),
      ...npcsProps,
    }
    this._all = seedNpcs(this.parent)
    random_attributes(this.all, this.order)
    this.inventory_init()
    this.fsm = new StateMachine(this, 'npcs')
    this.fsm.addState('idle')
    this.fsm.addState('place', {
      onEnter: this.onPlaceEnter.bind(this),
      onUpdate: this.onPlaceUpdate.bind(this),
      onExit: this.onPlaceExit.bind(this),
    })
    this.fsm.addState('active', {
      onEnter: this.onActiveEnter.bind(this),
      onUpdate: this.onActiveUpdate.bind(this),
      onExit: this.onActiveExit.bind(this),
    })
    this.fsm.addState('new', {
      onEnter: this.onNewEnter.bind(this),
      // onUpdate: this.onNewUpdate.bind(this),
      onExit: this.onNewExit.bind(this),
    })

    this.returnDoctors = this.returnDoctors.bind(this)
    this.returnSecurity = this.returnSecurity.bind(this)
  }
  public get all(): Npcs {
    return this._all
  }
  private onNewEnter(): void {
    print('npcsNewEnter')
    for (let i = this.order.length; i-- !== 0; ) {
      const npc = this.all[this.order[i]]

      npc.behavior.place = new Selector([])
      npc.behavior.active = new Selector([])
      npc.behavior.place.children.push(new PlaceSequence(npc))
      // testjpf npc setState is 'new'
      npc.fsm.update(dt)
      //TEST DEFAULTS
      if (
        (npc.currRoom == 'grounds' && npc.currStation == 'worker1') ||
        (npc.currRoom == 'reception' && npc.currStation == 'guest')
      ) {
        //this.a.behavior.place.children.push(new InjuredSequence(this.a))
        npc.hp = 0
        const IA = new InjuryAction(npc)
        const proceed = IA.run()
        proceed()
        npc.behavior.place.children = []
        npc.behavior.active.children.push(new InjuredSequence(npc))
      }
    }
  }
  // private onNewUpdate(): void {}
  private onNewExit(): void {
    this.sort_npcs_by_encounter()
    for (let i = this.order.length; i-- !== 0; ) {
      const npc = this.all[this.order[i]]
      npc.fsm.setState('active')
    }
  }
  private onPlaceEnter(): void {}
  private onPlaceUpdate(): void {
    print('<< :: NPCSplaceUpdate() :: >>')
    this.sort_npcs_by_encounter()
    for (let i = this.order.length; i-- !== 0; ) {
      const npc = this.all[this.order[i]]
      //i could add logic here to
      //handle doc logic separately.?
      //testjpf
      npc.behavior.place.children.push(new PlaceSequence(npc))
      npc.fsm.update(dt)
      // prettier-ignore
      // print( 'NPCSonPlaceUpdate::: ///states/npcs:: ||| room:', npc.currRoom, '| station:', npc.currStation, '| name: ', npc.name )
    }
    //some of this NEED TO HAPPEN POST PLACING!
    /**
     * testjpf
     * loop again?
     * change state to something else (MTG terms)
     * loop there. better game logic?
     */
    //this.fsm.setState('active')
  }
  private onPlaceExit(): void {
    for (let i = this.order.length; i-- !== 0; ) {
      const npc = this.all[this.order[i]]
      npc.fsm.setState('active')
    }
  }
  private onActiveEnter(): void {
    print('npcsActiveEnter')
    // this.medical()
    this.security()
  }
  private onActiveUpdate(): void {}
  private onActiveExit(): void {
    print('NPCSAVTIVEEXIT!!!')
    this.sort_npcs_by_encounter()
    for (let i = this.order.length; i-- !== 0; ) {
      const npc = this.all[this.order[i]]
      npc.fsm.setState('turn')
    }
  }
  returnMendeeLocation(): string | null {
    const injured = this.parent.getMendingQueue()[0]
    return injured === null ? null : this.all[injured].currRoom
  }
  security() {
    const cops = this.returnSecurity()
    for (const cop of cops) {
      const stations = RoomsInitState[cop.currRoom].stations
      let sKey: keyof typeof stations
      let target = ''
      for (sKey in stations) {
        target = stations[sKey]
        if (
          target !== '' &&
          this.all[target].fsm.getState() === 'trespass' &&
          target !== cop.name &&
          confrontation_check(cop.traits, this._all[target].traits) == true
        ) {
          print('NEWQUESTIONEDNPC!!!', cop.name, target)
          this.parent.taskBuilder(cop.name, 'questioning', target, 'clearance')
          break
        }
        target = 'player'
      }
      if (
        target == 'player' &&
        cop.currRoom == this.parent.getPlayerRoom() &&
        this.parent.playerFSM.getState() == 'trespass' &&
        confrontation_check(cop.traits, this.parent.playerTraits) == true
      ) {
        this.parent.taskBuilder(cop.name, 'questioning', 'player', 'clearance')
      }
    }
  }
  medical() {
    let count = this.infirmed.length
    for (const doc of this.returnDoctors()) {
      const mobile = !immobile.includes(doc.fsm.getState())
      if (mobile === true && count > 1) {
        // should be action!
        doc.fsm.setState('erfull')
        count = 0
      } else if (
        mobile === true &&
        count < 1 &&
        this.parent.getMendingQueue().length > 0
      ) {
        // should be action!
        doc.fsm.setState('paramedic')
      } else if (mobile === true) {
        doc.fsm.setState('turn')
      }
    }
  }
  addIgnore(n: string): void {
    this.ignore.push(n)
  }
  getIgnore(): string[] {
    return this.ignore
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
        this.all[a].sincePlayerRoom - this.all[b].sincePlayerRoom
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
}

function adjust_binaries(value: number, clan: string, binary: string) {
  let adj = binaryLookup[clan][binary] + value + math.random(-0.4, 0.4)
  if (adj > 1) {
    adj = 1
  } else if (adj < -1) {
    adj = -1
  }

  return adj
}

function seedNpcs(lists: NpcProps) {
  const seeded: Npcs = {}
  let ki: keyof typeof NpcsInitState
  for (ki in NpcsInitState) {
    seeded[ki] = new NpcState(ki, lists)
    seeded[ki].behavior.place.children.push(new PlaceSequence(seeded[ki]))
  }
  return seeded
}

function random_attributes(npcs: Npcs, order: string[]) {
  const aiPaths = ['inky', 'blinky', 'pinky', 'clyde']
  const startskills = [1, 2, 3, 5, 7, 7, 8, 8]
  const startbins = [-0.3, 0.3, -1, -0.5, -0.1, 0.1, 0.5, 1]
  let path = 0
  let count = 1

  let kn: keyof typeof npcs
  for (kn in npcs) {
    order.splice(count, 0, kn)
    npcs[kn].sincePlayerRoom = math.random(5, 15)
    npcs[kn].love = math.random(-1, 1)
    // random attitude
    npcs[kn].traits.opinion = {}
    let kbl: keyof typeof binaryLookup
    for (kbl in binaryLookup) {
      npcs[kn].traits.opinion[kbl] = math.random(-9, 9)
    }
    if (path > 3) {
      count++
      path = 0
      if (count > 6) count = 1
    }
    npcs[kn].race = `race0${path + 1}_0${count}`
    npcs[kn].aiPath = aiPaths[path]
    path = path + 1

    // random skills
    const tempskills = shuffle(startskills)
    let s_count = 0

    npcs[kn].traits.skills = {}
    let ks: keyof typeof seedSkills
    for (ks in seedSkills) {
      npcs[kn].traits.skills[ks] = tempskills[s_count] + math.random(-1, 1)
      s_count = s_count + 1
    }

    // random binaries
    const tempbins = shuffle(startbins)
    let b_count = 0

    npcs[kn].traits.binaries = {}
    let kb: keyof typeof seedBinaries
    for (kb in seedBinaries) {
      const adjustment = adjust_binaries(tempbins[b_count], npcs[kn].clan, kb)
      npcs[kn].traits.binaries[kb] = adjustment
      b_count = b_count + 1
    }
  }
}
