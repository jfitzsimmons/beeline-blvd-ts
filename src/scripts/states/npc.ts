/* eslint-disable @typescript-eslint/no-empty-function */
import {
  ActionProps,
  BehaviorKeys,
  BehaviorProps,
  BehaviorSetters,
} from '../../types/behaviors'
import { Behavior, InventoryTableItem } from '../../types/state'
import { Effect } from '../../types/tasks'
import { NpcProps } from '../../types/world'
import { NpcsInitState } from './inits/npcsInitState'
import { RoomsInitState } from './inits/roomsInitState'
import { itemStateInit } from './inits/inventoryInitState'
import ActorState from './actor'
import Sequence from '../behaviors/sequence'
import Selector from '../behaviors/selector'
import {
  fillStationAttempt,
  set_room_priority,
  set_npc_target,
} from '../utils/ai'
import { surrounding_room_matrix } from '../utils/utils'

export default class NpcState extends ActorState {
  home: { x: number; y: number }
  clan: string
  body: string
  love = 0
  currStation = ''
  currRoom = 'grounds'
  exitRoom = 'grounds'
  p: NpcProps
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
    this.matrix = { x: 0, y: 0 }
    this.p = lists

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
        cops: () => {
          return {
            checkSetStation: this.p.rooms.checkSetStation.bind(this),
            getWards: this.p.rooms.getWards.bind(this),
            getWantedQueue: this.p.npcs.getWantedQueue.bind(this),
            addAdjustWantedQueue: this.p.npcs.addAdjustWantedQueue.bind(this),
            getBehaviorProps: this.getBehaviorProps.bind(this),
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
            checkSetStation: this.p.rooms.checkSetStation.bind(this),
            getWards: this.p.rooms.getWards.bind(this),
            getMendingQueue: this.p.npcs.getMendingQueue.bind(this),
            returnMendeeLocation: this.p.npcs.returnMendeeLocation.bind(this),
            ...behaviorDefaults(),
          }
        },
        onScreen: () => {
          return {
            returnPlayer: this.p.world.returnPlayer.bind(this),
            setConfrontation: this.p.novel.setConfrontation.bind(this),
            ...behaviorDefaults(),
          }
        },
        injury: () => {
          return {
            //addInjured: this.p.addInjured.bind(this),
            ...behaviorDefaults(),
          }
        },
        mender: () => {
          return {
            returnNpc: this.p.world.returnNpc.bind(this),
            getFocusedRoom: this.p.rooms.getFocusedRoom.bind(this),
            ...behaviorDefaults(),
          }
        },
        immobile: () => {
          return {
            pruneStationMap: this.p.rooms.pruneStationMap.bind(this),
            ...behaviorDefaults(),
          }
        },
        injured: () => {
          return {
            traits: this.traits,
            exitRoom: this.exitRoom,
            returnNpc: this.p.world.returnNpc.bind(this),
            getMendingQueue: this.p.npcs.getMendingQueue.bind(this),
            getOccupants: this.p.rooms.getOccupants.bind(this),
            getIgnore: this.p.npcs.getIgnore.bind(this),
            addAdjustMendingQueue: this.p.npcs.addAdjustMendingQueue.bind(this),
            getFocusedRoom: this.p.rooms.getFocusedRoom.bind(this),
            ...behaviorDefaults(),
          }
        },
        helper: () => {
          return {
            clearance: this.clearance,
            clan: this.clan,
            returnNpc: this.p.world.returnNpc.bind(this),
            getOccupants: this.p.rooms.getOccupants.bind(this),
            addAdjustMendingQueue: this.p.npcs.addAdjustMendingQueue.bind(this),
            exitRoom: this.exitRoom,
            findRoomPlaceStation: this.findRoomPlaceStation.bind(this),
            makePriorityRoomList: this.makePriorityRoomList.bind(this),
            getMendingQueue: this.p.npcs.getMendingQueue.bind(this),
            getFocusedRoom: this.p.rooms.getFocusedRoom.bind(this),
            ...behaviorDefaults(),
          }
        },
        mendee: () => {
          return {
            returnNpc: this.p.world.returnNpc.bind(this),
            addIgnore: this.p.npcs.addIgnore.bind(this),
            removeMendee: this.p.npcs.removeMendee.bind(this),
            addAdjustMendingQueue: this.p.npcs.addAdjustMendingQueue.bind(this),
            ...behaviorDefaults(),
          }
        },
        infirm: () => {
          return {
            exitRoom: this.exitRoom,
            sendToVacancy: this.p.rooms.sendToVacancy.bind(this),
            // addInfirmed: this.p.addInfirmed.bind(this),
            ...behaviorDefaults(),
          }
        },
        infirmed: () => {
          return {
            clearance: this.clearance,
            getOccupants: this.p.rooms.getOccupants.bind(this),
            // removeInfirmed: this.p.removeInfirmed.bind(this),
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
            getFocusedRoom: this.p.rooms.getFocusedRoom.bind(this),
            removeInvBonus: this.removeInvBonus.bind(this),
            addInvBonus: this.addInvBonus.bind(this),
            addOrExtendEffect: this.addOrExtendEffect.bind(this),
            getBehaviorProps: this.getBehaviorProps.bind(this),
            getOccupants: this.p.rooms.getOccupants.bind(this),
            updateInventory: this.updateInventory.bind(this),
            returnNpc: this.p.world.returnNpc.bind(this),
            addAdjustWantedQueue: this.p.npcs.addAdjustWantedQueue.bind(this),
            ...behaviorDefaults(),
          }
        },
        announcer: () => {
          return {
            clan: this.clan,
            love: this.love,
            traits: this.traits,
            addOrExtendEffect: this.addOrExtendEffect.bind(this),
            getOccupants: this.p.rooms.getOccupants.bind(this),
            returnNpc: this.p.world.returnNpc.bind(this),
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
    if (this.behavior.active.children.length > 0)
      print(
        '==>> SET ::: NextTurn: Active Behaviors::',
        this.behavior.active.children[0].constructor.name,
        this.behavior.active.children.length
      )
  }
  private onTurnUpdate(): void {
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
    const playerRoom = this.p.rooms.getFocusedRoom()
    const roomTarget = t !== undefined ? t : RoomsInitState[playerRoom].matrix
    const rooms = r !== undefined ? r : this.makePriorityRoomList(roomTarget)

    this.exitRoom = this.currRoom

    const { chosenRoom, chosenStation } = fillStationAttempt(
      rooms,
      this.name,
      this.matrix,
      this.clan,
      this.p.rooms.getStationMap()
    )
    this.p.rooms.clearStation(this.currRoom, this.currStation, this.name)
    this.p.rooms.setStation(chosenRoom, chosenStation, this.name)

    //prettier-ignore
    print('length:!:',rooms.length,this.name,':: findRoomPlaceStation ::',chosenRoom,chosenStation,':EXIT:',this.exitRoom)

    this.currRoom = chosenRoom
    this.currStation = chosenStation
    this.matrix = RoomsInitState[chosenRoom].matrix
    if (this.turnPriority > 93) return
    if (math.random() > 0.4 && chosenRoom === playerRoom) {
      this.turnPriority = 0
    } else {
      this.turnPriority = this.turnPriority + 1
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
  }
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
    if (item.skills == null || item.skills == undefined) {
      print('addInvBonus', i)
      print('addInvBonus2', item.value)
    }
    let sKey: keyof typeof item.skills
    for (sKey in item.skills)
      this.traits.skills[sKey] = this.traits.skills[sKey] + item.skills[sKey]

    let bKey: keyof typeof item.binaries
    for (bKey in item.binaries)
      this.traits.binaries[bKey] =
        this.traits.binaries[bKey] + item.binaries[bKey]
  }
  updateInventory(addDelete: 'add' | 'delete', item: string) {
    if (addDelete == 'add') {
      this.inventory.push(item)
      this.addInvBonus(item)
    } else {
      this.inventory.splice(this.inventory.indexOf(item), 1)
      this.removeInvBonus(item)
    }
  }
  addOrExtendEffect(e: Effect) {
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
