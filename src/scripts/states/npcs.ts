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
import { arraymove, shuffle } from '../utils/utils'
import { RoomsInitPriority, RoomsInitState } from './inits/roomsInitState'
//import { confrontation_check } from './inits/checksFuncs'
import PlaceSequence from '../behaviors/sequences/placeSequence'
import Selector from '../behaviors/selector'
import InjuredSequence from '../behaviors/sequences/injuredSequence'
import ImmobileSequence from '../behaviors/sequences/immobileSequence'
import TrespassSequence from '../behaviors/sequences/trespassSequence'
import { getRoomPlaceCount, resetRoomPlaceCount } from '../utils/ai'

const dt = math.randomseed(os.time())

export default class WorldNpcs {
  fsm: StateMachine
  private _all: Npcs
  order: string[]
  onScreen: string[]
  offScreen: string[]
  quests: QuestMethods
  parent: NpcProps
  //infirmed: string[]
  //injured: string[]
  ignore: string[]
  mendingQueue: string[]

  constructor(npcsProps: WorldNpcsArgs) {
    // this.infirmed = [] // move to room? infrimed action?
    //this.injured = [] // room? injured action?
    this.mendingQueue = []
    this.ignore = []
    this.order = []
    this.onScreen = []
    this.offScreen = []
    this.quests = {
      returnDoctors: this.returnDoctors.bind(this),
      returnSecurity: this.returnDoctors.bind(this),
      returnAll: this.returnAll.bind(this),
      returnOrderAll: this.returnOrderAll.bind(this),
    }
    this.parent = {
      onScreen: this.onScreen,
      // addInfirmed: this.addInfirmed.bind(this),
      //getWards: this.parent.getWards.bind(this),
      //getInjured: this.getInjured.bind(this),
      getIgnore: this.getIgnore.bind(this),
      //  removeInfirmed: this.removeInfirmed.bind(this),
      //addInjured: this.addInjured.bind(this),
      // removeInjured: this.removeInjured.bind(this),
      addIgnore: this.addIgnore.bind(this),
      removeIgnore: this.removeIgnore.bind(this),
      returnMendeeLocation: this.returnMendeeLocation.bind(this),
      returnDoctors: this.returnDoctors.bind(this),
      returnSecurity: this.returnDoctors.bind(this),
      returnAll: this.returnAll.bind(this),
      returnOrderAll: this.returnOrderAll.bind(this),
      getMendingQueue: this.getMendingQueue.bind(this),
      addAdjustMendingQueue: this.addAdjustMendingQueue.bind(this),
      removeMendee: this.removeMendee.bind(this),
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
    for (let i = this.order.length; i-- !== 0; ) {
      const npc = this.all[this.order[i]]
      print('===>>> NEWPLACING::: NPCSSTATE:: FOR::', npc.name)

      npc.behavior.place = new Selector([])
      npc.behavior.active = new Selector([])
      npc.findRoomPlaceStation({ x: 0, y: 0 }, [...RoomsInitPriority])

      npc.fsm.update(dt)
      //TEST DEFAULTS
      //Simulating behaviors.Active
      const playerRoom = this.parent.getPlayerRoom()

      playerRoom == npc.currRoom
        ? this.onScreen.push(npc.name)
        : this.offScreen.push(npc.name)
      if (
        (npc.currRoom == 'grounds' && npc.currStation == 'worker1') ||
        (npc.currRoom == 'reception' && npc.currStation == 'guest')
      ) {
        npc.hp = 0
        npc.turnPriority = 98
        //npc.parent.addInjured(npc.name)
        //new InjuryAction(npc.getBehaviorProps.bind(this)).run()
      }
    }
    resetRoomPlaceCount()
  }
  private onNewExit(): void {
    this.sort_npcs_by_encounter()
    for (let i = this.order.length; i-- !== 0; ) {
      const npc = this.all[this.order[i]]
      print('===>>> SETTING::', npc.name, 'TO.ACTIVE')

      if (npc.hp < 1) {
        print('newexit injseq', npc.name)
        npc.behavior.active.children.push(
          new InjuredSequence(npc.getBehaviorProps.bind(npc))
        )
        if (
          !npc.behavior.place.children.some(
            (c) => c instanceof ImmobileSequence
          )
        )
          npc.behavior.active.children.push(
            new ImmobileSequence(npc.getBehaviorProps.bind(npc))
          )
      } else if (
        npc.clearance + math.random(0, 1) <
        RoomsInitState[npc.currRoom].clearance
      ) {
        npc.behavior.active.children.push(
          new TrespassSequence(npc.getBehaviorProps.bind(npc))
        )
      }
      npc.fsm.setState('active')
    }
  }
  private onPlaceEnter(): void {
    //testjpf
  }

  private onPlaceUpdate(): void {
    const rpctestjpc: {
      [key: string]: {
        npcs: string[]
        occupants: number
        ai: { [key: string]: number }
      }
    } = {}
    this.onScreen = []
    this.offScreen = []
    print('<< << :: NPCSplaceUpdate() :: >> >>')
    const playerRoom = this.parent.getPlayerRoom()
    this.sort_npcs_by_encounter()

    for (let i = this.order.length; i-- !== 0; ) {
      const npc = this.all[this.order[i]]
      print(
        '===>>> PLACING::: NPCSSTATE:: FOR::',
        npc.name,
        npc.turnPriority,
        npc.currRoom,
        npc.aiPath
      )
      // print(rpc[npc.currRoom])
      // print(rpc[npc.currRoom][npc.aiPath])
      npc.fsm.update(dt)

      if (rpctestjpc[npc.currRoom] != null) {
        rpctestjpc[npc.currRoom].occupants += 1
      } else {
        rpctestjpc[npc.currRoom] = {
          occupants: 1,
          ai: { clyde: 0, pinky: 0, blinky: 0, inky: 0 },
          npcs: [],
        }
      }
      rpctestjpc[npc.currRoom].npcs.push(npc.name)

      if (rpctestjpc[npc.currRoom].ai[npc.aiPath] != null) {
        rpctestjpc[npc.currRoom].ai[npc.aiPath] += 1
      } else {
        rpctestjpc[npc.currRoom].ai[npc.aiPath] = 1
      }

      playerRoom == npc.currRoom
        ? this.onScreen.push(npc.name)
        : this.offScreen.push(npc.name)

      if (
          npc.clearance <
          RoomsInitState[npc.currRoom].clearance
        )
          npc.behavior.active.children.push(
            new TrespassSequence(npc.getBehaviorProps.bind(npc))
          )
      // prettier-ignore
      // print( 'NPCSonPlaceUpdate::: ///states/npcs:: ||| room:', npc.currRoom, '| station:', npc.currStation, '| name: ', npc.name )
    }
    let rk: keyof typeof rpctestjpc
    for (rk in rpctestjpc) {
      const room = rpctestjpc[rk]
      getRoomPlaceCount(rk)

      print('NPCSrpc::: occs: ', rk, room.occupants)
      print('NPCSrpc::: listed: ', rk, getRoomPlaceCount(rk))
      let vk: keyof typeof room.ai
      for (const n of room.npcs) {
        print('NPCSrpc::: npcs: ', rk, n, this._all[n].currStation)
      }
      for (vk in room.ai) {
        print('NPCSrpc::: key: ', rk, vk, room.ai[vk])
      }
    }
    resetRoomPlaceCount()
  }

  private onPlaceExit(): void {
    //filter out onscreen testjpf
    for (let i = this.order.length; i-- !== 0; ) {
      const npc = this.all[this.order[i]]

      if (npc.hp < 1 && npc.behavior.active.children.length < 1) {
        print('placeexit injseq', npc.name)

        npc.behavior.active.children.push(
          new InjuredSequence(npc.getBehaviorProps.bind(npc))
        )
        if (
          !npc.behavior.place.children.some(
            (c) => c instanceof ImmobileSequence
          )
        )
          npc.behavior.place.children.push(
            new ImmobileSequence(npc.getBehaviorProps.bind(npc))
          )
      }
    }

    this.offScreen.sort(
      (a: string, b: string) =>
        this.all[a].turnPriority - this.all[b].turnPriority
    )
    for (let i = this.offScreen.length; i-- !== 0; ) {
      print('===>>> SETTING this.offScreen::', this.offScreen[i], 'TO.ACTIVE')
      if (this.all[this.offScreen[i]].behavior.active.children.length > 0)
        print(
          '===>>> SETTING ::: BeginTurn: Active Behaviors::',
          this.all[this.offScreen[i]].behavior.active.children[0].constructor
            .name,
          this.all[this.offScreen[i]].behavior.active.children.length
        )
      this.all[this.offScreen[i]].fsm.setState('active')
    }
    this.onScreen.sort(
      (a: string, b: string) =>
        this.all[a].turnPriority - this.all[b].turnPriority
    )
    this.onScreen.push('player')
    const player = this.parent.returnPlayer()
    print('this.onScreen.length', this.onScreen.length)

    for (let i = this.onScreen.length; i-- !== 0; ) {
      const actor =
        this.onScreen[i] === 'player' ? player : this.all[this.onScreen[i]]
      // const actions = actor.behavior.active.children

      //if (actor.turnPriority == 99) {
      // print('NPCS::: onplaceExit:: InjuredPriority!!! ONSCREEN:', actor.name)
      //  actor.behavior.active.run()
      // }
      if (actor.name !== 'player') {
        print('===>>> SETTING::', actor.name, 'TO.ONSCREEN')
        if (this.all[actor.name].behavior.active.children.length > 0)
          print(
            '===>>> SETTING ::: BeginOnScreen: Active Behaviors::',
            this.all[actor.name].behavior.active.children[0].constructor.name,
            this.all[actor.name].behavior.active.children.length
          )
        actor.fsm.setState('onscreen')
      }
    }
  }
  private onActiveEnter(): void {
    //  this.sort_npcs_by_encounter()
    print('ALL NPCS Active')
    // this.security()
  }
  private onActiveUpdate(): void {
    /**
     * need some sort of logic
     * for player level interaction
     * how does onScreen behavior work?
     */
  }
  private onActiveExit(): void {
    print('NPCSAVTIVEEXIT!!!')
    //this.sort_npcs_by_encounter()
    this.onScreen.splice(this.onScreen.indexOf('player'), 1)
    this.onScreen.sort(
      (a: string, b: string) =>
        this.all[a].turnPriority - this.all[b].turnPriority
    )
    for (let i = this.onScreen.length; i-- !== 0; ) {
      const npc = this.all[this.onScreen[i]]
      //testjpf Rethink??
      if (npc.behavior.place.children.length < 1 && npc.turnPriority < 97)
        npc.behavior.place.children.push(
          new PlaceSequence(npc.getBehaviorProps.bind(npc))
        )
      print('===>>> SETTING ONSCREEN::', this.onScreen[i], 'TO.TURN')
      this.all[this.onScreen[i]].fsm.setState('turn')
    }

    this.offScreen.sort(
      (a: string, b: string) =>
        this.all[a].turnPriority - this.all[b].turnPriority
    )
    for (let i = this.offScreen.length; i-- !== 0; ) {
      const npc = this.all[this.offScreen[i]]
      //testjpf Rethink??
      if (npc.behavior.place.children.length < 1 && npc.turnPriority < 97)
        npc.behavior.place.children.push(
          new PlaceSequence(npc.getBehaviorProps.bind(npc))
        )
      print('===>>> SETTING OffSCREEN::', npc.name, 'TO.TURN')
      npc.fsm.setState('turn')
    }
  }
  removeMendee(m: string) {
    this.mendingQueue.splice(this.mendingQueue.indexOf(m), 1)
  }
  addAdjustMendingQueue(patient: string) {
    if (this.mendingQueue.includes(patient) == true) {
      if (this.mendingQueue.indexOf(patient) > 1)
        arraymove(this.mendingQueue, this.mendingQueue.indexOf(patient), 0)
    } else {
      // print('cautions caused patient:', patient, 'to be added to mendingQueue')
      this.mendingQueue.push(patient)
    }
  }
  returnMendeeLocation(): string | null {
    const injured = this.getMendingQueue()[0]
    return injured === null ? null : this.all[injured].currRoom
  }
  security() {
    //const cops = this.returnSecurity()
    //for (const cop of cops) {
    // const stations = RoomsInitState[cop.currRoom].stations
    //let sKey: keyof typeof stations
    //const target = cop
    /**
       * for (sKey in stations) {
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
      // testjpf need to push trespassSeq to player behavior
      if (
        target == 'player' &&
        cop.currRoom == this.parent.getPlayerRoom() &&
        this.parent.playerFSM.getState() == 'trespass' &&
        confrontation_check(cop.traits, this.parent.playerTraits) == true
      ) {
        this.parent.taskBuilder(cop.name, 'questioning', 'player', 'clearance')
      }
    }*/
  }
  getMendingQueue(): string[] {
    return this.mendingQueue
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
        this.all[a].turnPriority - this.all[b].turnPriority
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
    npcs[kn].turnPriority = math.random(5, 15)
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
