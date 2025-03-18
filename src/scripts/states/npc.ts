/* eslint-disable @typescript-eslint/no-empty-function */
import { NpcsInitState } from './inits/npcsInitState'
import { RoomsInitState } from './inits/roomsInitState'
import { itemStateInit } from './inits/inventoryInitState'
import { Behavior, InventoryTableItem } from '../../types/state'
import { Effect } from '../../types/tasks'
import { NpcProps } from '../../types/world'
import { NovelNpc } from '../../types/novel'
import {
  fillStationAttempt,
  set_room_priority,
  set_npc_target,
} from '../utils/ai'
import { surrounding_room_matrix } from '../utils/utils'
import ActorState from './actor'
import Sequence from '../behaviors/sequence'
import {
  ActionProps,
  BehaviorKeys,
  BehaviorProps,
  BehaviorSetters,
} from '../../types/behaviors'
import Selector from '../behaviors/selector'

export default class NpcState extends ActorState {
  //prototype: any
  home: { x: number; y: number }
  clan: string
  body: string
  love = 0
  currStation = ''
  currRoom = 'grounds'
  exitRoom = 'grounds'
  parent: NpcProps
  convos = 0
  actions: string[] = ['talk', 'give', 'trade', 'pockets']
  aiPath = ''
  sincePlayerConvo = 99
  behavior: Behavior
  constructor(n: string, lists: NpcProps) {
    super(n, lists) // 👈️ call super() here
    //TESTJPFDEBUG HP
    this.hp = math.random(1, 3)
    this.home = NpcsInitState[n].home
    this.name = NpcsInitState[n].name
    this.inventory = NpcsInitState[n].inventory
    this.clearance = NpcsInitState[n].clearance
    this.clan = NpcsInitState[n].clan
    this.body = NpcsInitState[n].body
    // this.fsm = new StateMachine(this, 'npc' + n)
    this.matrix = { x: 0, y: 0 }
    this.parent = lists

    const behaviorDefaults = () => {
      return {
        name: this.name,
        matrix: this.matrix,
        cooldown: this.cooldown,
        turnPriority: this.turnPriority,
        currRoom: this.currRoom,
        currStation: this.currStation,
        behavior: this.behavior,
        addToBehavior: this.addToBehavior.bind(this),
        hp: this.hp,
        updateFromBehavior: this.updateFromBehavior.bind(this),
      }
    }

    //    const behaviorProps:
    this.behavior = {
      place: new Selector([]),
      active: new Selector([]),
      update: {
        cooldown: (value) => (this.cooldown = value as number),
        hp: (value) => (this.hp = value as number),
        clearance: (value) => (this.clearance = value as number),
        turnPriority: (value) => (this.turnPriority = value as number),
        station: (value) => {
          const v = value as [string, string]
          this.matrix = RoomsInitState[v[0]].matrix
          this.exitRoom = this.currRoom
          this.currRoom = v[0]
          this.currStation = v[1]
          //return
        },
      },
      props: {
        effects: () => {
          return { effects: this.effects, traits: this.traits }
        },
        place: () => {
          return {
            clearance: this.clearance,
            clan: this.clan,
            exitRoom: this.exitRoom,
            findRoomPlaceStation: this.findRoomPlaceStation.bind(this),
            ...behaviorDefaults(),
          }
        },
        medplace: () => {
          return {
            clearance: this.clearance,
            clan: this.clan,
            exitRoom: this.exitRoom,
            findRoomPlaceStation: this.findRoomPlaceStation.bind(this),
            checkSetStation: this.parent.checkSetStation.bind(this),
            getWards: this.parent.getWards.bind(this),
            getMendingQueue: this.parent.getMendingQueue.bind(this),
            returnMendeeLocation: this.parent.returnMendeeLocation.bind(this),
            ...behaviorDefaults(),
          }
        },
        injury: () => {
          return {
            //addInjured: this.parent.addInjured.bind(this),
            ...behaviorDefaults(),
          }
        },
        mender: () => {
          return {
            returnNpc: this.parent.returnNpc.bind(this),
            getFocusedRoom: this.parent.getFocusedRoom.bind(this),
            ...behaviorDefaults(),
          }
        },
        immobile: () => {
          return {
            pruneStationMap: this.parent.pruneStationMap.bind(this),
            ...behaviorDefaults(),
          }
        },
        injured: () => {
          return {
            traits: this.traits,
            exitRoom: this.exitRoom,
            returnNpc: this.parent.returnNpc.bind(this),
            getMendingQueue: this.parent.getMendingQueue.bind(this),
            getOccupants: this.parent.getOccupants.bind(this),
            getIgnore: this.parent.getIgnore.bind(this),
            addAdjustMendingQueue: this.parent.addAdjustMendingQueue.bind(this),
            ...behaviorDefaults(),
          }
        },
        helper: () => {
          return {
            clearance: this.clearance,
            clan: this.clan,
            returnNpc: this.parent.returnNpc.bind(this),
            getOccupants: this.parent.getOccupants.bind(this),
            addAdjustMendingQueue: this.parent.addAdjustMendingQueue.bind(this),
            exitRoom: this.exitRoom,
            findRoomPlaceStation: this.findRoomPlaceStation.bind(this),
            makePriorityRoomList: this.makePriorityRoomList.bind(this),
            getMendingQueue: this.parent.getMendingQueue.bind(this),
            getFocusedRoom: this.parent.getFocusedRoom.bind(this),
            ...behaviorDefaults(),
          }
        },
        mendee: () => {
          return {
            returnNpc: this.parent.returnNpc.bind(this),
            addIgnore: this.parent.addIgnore.bind(this),
            removeMendee: this.parent.removeMendee.bind(this),
            addAdjustMendingQueue: this.parent.addAdjustMendingQueue.bind(this),
            ...behaviorDefaults(),
          }
        },
        infirm: () => {
          return {
            exitRoom: this.exitRoom,
            sendToVacancy: this.parent.sendToVacancy.bind(this),
            // addInfirmed: this.parent.addInfirmed.bind(this),
            ...behaviorDefaults(),
          }
        },
        infirmed: () => {
          return {
            clearance: this.clearance,
            getOccupants: this.parent.getOccupants.bind(this),
            // removeInfirmed: this.parent.removeInfirmed.bind(this),
            ...behaviorDefaults(),
          }
        },
        question: () => {
          return {
            traits: this.traits,
            inventory: this.inventory,
            clan: this.clan,
            love: this.love,
            exitRoom: this.exitRoom,
            getFocusedRoom: this.parent.getFocusedRoom.bind(this),
            addInvBonus: this.addInvBonus.bind(this),
            addOrExtendEffect: this.addOrExtendEffect.bind(this),
            getBehaviorProps: this.getBehaviorProps.bind(this),
            getOccupants: this.parent.getOccupants.bind(this),
            updateInventory: this.updateInventory.bind(this),
            ...behaviorDefaults(),
          }
        },
        announcer: () => {
          return {
            clan: this.clan,
            love: this.love,
            traits: this.traits,
            addOrExtendEffect: this.addOrExtendEffect.bind(this),
            getOccupants: this.parent.getOccupants.bind(this),
            returnNpc: this.parent.returnNpc.bind(this),
            getBehaviorProps: this.getBehaviorProps.bind(this),
            ...behaviorDefaults(),
          }
        },
      } as BehaviorProps,
    }

    this.fsm
      .addState('idle')
      .addState('active', {
        onEnter: this.onActiveEnter.bind(this),
        onUpdate: this.onActiveUpdate.bind(this),
        onExit: this.onActiveExit.bind(this),
      })
      .addState('confront', {
        onEnter: this.onConfrontPlayerEnter.bind(this),
        onUpdate: this.onConfrontPlayerUpdate.bind(this),
        onExit: this.onConfrontPlayerExit.bind(this),
      })
      .addState('arrestee', {
        onEnter: this.onArresteeEnter.bind(this),
        onUpdate: this.onArresteeUpdate.bind(this),
        onExit: this.onArresteeExit.bind(this),
      })
      .addState('onscreen', {
        onEnter: this.onOnScreenEnter.bind(this),
        onUpdate: this.onOnScreenUpdate.bind(this),
        onExit: this.onOnScreenExit.bind(this),
      })
      .addState('turn', {
        onEnter: this.onTurnEnter.bind(this),
        onUpdate: this.onTurnUpdate.bind(this),
        onExit: this.onTurnExit.bind(this),
      })
      .addState('new', {
        onEnter: this.onNewEnter.bind(this),
        onUpdate: this.onNewUpdate.bind(this),
        onExit: this.onNewExit.bind(this),
      })
    this.fsm.setState('new')
    this.addInvBonus = this.addInvBonus.bind(this)
    this.add_effects_bonus = this.add_effects_bonus.bind(this)
    this.addOrExtendEffect = this.addOrExtendEffect.bind(this)
    this.addToBehavior = this.addToBehavior.bind(this)
    this.getBehaviorProps = this.getBehaviorProps.bind(this)
    this.updateFromBehavior = this.updateFromBehavior.bind(this)
  }
  private onConfrontPlayerEnter(): void {
    this.convos++
  }
  private onConfrontPlayerUpdate(): void {}
  private onConfrontPlayerExit(): void {
    const novelUpdates: NovelNpc = this.parent.getNovelUpdates()
    this.convos = novelUpdates.convos
    this.traits = {
      skills: { ...novelUpdates.traits.skills },
      binaries: { ...novelUpdates.traits.binaries },
      opinion: { ...novelUpdates.traits.opinion },
    }
    //  this.sincePlayerConvo = novelUpdates.sincePlayerConvo
    this.love = novelUpdates.love
  }
  private onArresteeEnter(): void {}
  private onArresteeUpdate(): void {}
  private onArresteeExit(): void {}
  private onNewEnter(): void {}
  private onNewUpdate(): void {
    this.behavior.place.run()
    print(
      '==>> NEWPLACED::: NPCSTATE:: FOR::',
      this.name,
      this.currRoom,
      this.currStation
    )
  }
  private onNewExit(): void {
 
    // prettier-ignore
    // print( 'NPCSonPlaceUpdate::: ///states/npcs:: ||| room:', this.currRoom, '| exit:', this.exitRoom, '| name: ', this.name )
  }
  private onTurnEnter(): void {
    print('NPCCLASS::: onTurnEnter()')
    //this.behavior.active.run()
    if (this.behavior.active.children.length > 0)
      print(
        '==>> SET ::: NextTurn: Active Behaviors::',
        this.behavior.active.children[0].constructor.name,
        this.behavior.active.children.length
      )
  }
  private onTurnUpdate(): void {
    //print('===>>> PLACING::: NPCSTATE:: FOR::', this.name)
    this.behavior.place.run()
    print(
      '==>> PLACED::: NPCSTATE:: FOR::',
      this.name,
      this.currRoom,
      this.currStation,
      'from',
      this.exitRoom
    )
  }
  private onTurnExit(): void {
    //  print('TURNEXIT ACTIVErun')
  }
  private onActiveEnter(): void {
    this.behavior.active.run()
    if (this.behavior.active.children.length > 0)
      print(
        '==>> SET ::: ENDTurn: Active Behaviors::',
        this.behavior.active.children[0].constructor.name,
        this.behavior.active.children.length
      )
  }
  private onActiveUpdate(): void {}
  private onActiveExit(): void {}
  private onOnScreenEnter(): void {
    //testjpf remove ideal would be onscreen exit.??
    this.behavior.active.run()
    if (this.behavior.active.children.length > 0)
      print(
        '==>> SET ::: ENDTurn: ONSCREEN Behaviors::',
        this.behavior.active.children[0].constructor.name,
        this.behavior.active.children.length
      )
  }
  private onOnScreenUpdate(): void {}
  private onOnScreenExit(): void {
    print('NPCSTATE:: FOR::', this.name, 'onOnScreenExit yes-RUN')
    //    this.behavior.active.run()
  }
  makePriorityRoomList(target: { x: number; y: number }): string[] {
    const npcPriorityProps = {
      matrix: this.matrix,
      home: this.home,
      clearance: this.clearance,
    }
    const npcTurnProps = {
      turnPriority: this.turnPriority,
      aiPath: this.aiPath,
      target: target,
      ...npcPriorityProps,
    }

    return set_room_priority(
      set_npc_target(
        surrounding_room_matrix(target, this.matrix),
        npcTurnProps
      ),
      npcPriorityProps
    )
  }
  findRoomPlaceStation(
    t: { x: number; y: number } | undefined = undefined,
    r: string[] | undefined = undefined
  ): void {
    const target =
      t !== undefined ? t : RoomsInitState[this.parent.getPlayerRoom()].matrix
    const rooms = r !== undefined ? r : this.makePriorityRoomList(target)

    this.exitRoom = this.currRoom
    this.parent.clearStation(this.currRoom, this.currStation, this.name)
    const { chosenRoom, chosenStation } = fillStationAttempt(
      rooms,
      this.name,
      this.matrix,
      this.clan,
      this.parent.getStationMap()
    )
    print(
      'ROOMS.LENGTH:!:',
      rooms.length,
      this.name,
      '::: findrooomplacestation:: STATION:::',
      chosenRoom,
      chosenStation,
      'exit room:',
      this.exitRoom,
      this.parent.getPlayerRoom()
    )

    this.currRoom = chosenRoom
    this.currStation = chosenStation
    this.matrix = RoomsInitState[chosenRoom].matrix
    this.parent.setStation(chosenRoom, chosenStation, this.name)
    //this.parent.pruneStationMap(chosenRoom, chosenStation)
    if (this.turnPriority > 93) return
    if (chosenRoom != this.parent.getPlayerRoom()) {
      this.turnPriority = this.turnPriority + 1
    } else {
      this.turnPriority = 0
    }
  }
  addToBehavior(selector: 'place' | 'active', s: Sequence, unshift = false) {
    unshift === false
      ? this.behavior[selector].children.push(s)
      : this.behavior[selector].children.unshift(s)
  }
  getBehaviorProps(behavior: BehaviorKeys): ActionProps {
    const props = this.behavior.props as BehaviorProps
    return props[behavior]()
  }
  updateFromBehavior(
    prop: keyof BehaviorSetters,
    value: number | [string, string]
  ): void {
    this.behavior.update[prop](value)

    //this.behavior.props[behavior]()
  }
  //updateBehaviorProps(behavior: NpcKeys, value: NpcValues) {
  // this[behavior] = value
  //}
  removeInvBonus(i: string) {
    const item: InventoryTableItem = { ...itemStateInit[i] }
    let sKey: keyof typeof item.skills
    for (sKey in item.skills)
      this.traits.skills[sKey] = this.traits.skills[sKey] - item.skills[sKey]

    let bKey: keyof typeof item.binaries
    for (bKey in item.binaries)
      this.traits.binaries[bKey] =
        this.traits.binaries[bKey] - item.binaries[bKey]
  }
  addInvBonus(i: string) {
    const item: InventoryTableItem = { ...itemStateInit[i] }
    //print('NPCADDinvONUS: Item', i)
    let sKey: keyof typeof item.skills
    for (sKey in item.skills)
      this.traits.skills[sKey] = this.traits.skills[sKey] + item.skills[sKey]

    let bKey: keyof typeof item.binaries
    for (bKey in item.binaries)
      this.traits.binaries[bKey] =
        this.traits.binaries[bKey] + item.binaries[bKey]
  }
  updateInventory(addDelete: 'add' | 'delete', item: string) {
    // const inventory = this[storage].inventory

    if (addDelete == 'add') {
      this.inventory.push(item)
      this.addInvBonus(item)
    } else {
      this.inventory.splice(this.inventory.indexOf(item), 1)
      this.removeInvBonus(item)
    }
  }
  addOrExtendEffect(e: Effect) {
    //   let ek: keyof typeof this.effects
    print('EffectAddExtend: ', e.label)
    for (const fx of this.effects) {
      if (e.label === fx.label) {
        fx.turns += 5
        return
      }
    }
    this.effects.push(e)
    this.add_effects_bonus(e)
  }
  add_effects_bonus(e: Effect) {
    this.traits[e.fx.type]![e.fx.stat] =
      this.traits[e.fx.type]![e.fx.stat] + e.fx.adjustment
  }
  remove_effects_bonus(e: Effect) {
    this.traits[e.fx.type]![e.fx.stat] =
      this.traits[e.fx.type]![e.fx.stat] - e.fx.adjustment
  }
  remove_effects(effects: Effect[]) {
    if (effects.length < 1) return
    //let eKey: keyof typeof
    for (let i = effects.length; i-- !== 0; ) {
      const e = effects[i]
      if (e.turns < 0) {
        this.remove_effects_bonus(e)
        effects.splice(i, 1)
      } else {
        e.turns = e.turns - 1
      }
    }
  }
}
