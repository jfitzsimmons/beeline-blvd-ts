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
  DefaultBehaviorProps,
} from '../../types/behaviors'
import Selector from '../behaviors/selector'

export default class NpcState extends ActorState {
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
  sincePlayerRoom = 0
  sincePlayerConvo = 99
  behavior: Behavior
  constructor(n: string, lists: NpcProps) {
    super(n, lists) // 👈️ call super() here
    //TESTJPFDEBUG HP
    this.hp = 1
    this.home = NpcsInitState[n].home
    this.name = NpcsInitState[n].name
    this.inventory = NpcsInitState[n].inventory
    this.clearance = NpcsInitState[n].clearance
    this.clan = NpcsInitState[n].clan
    this.body = NpcsInitState[n].body
    // this.fsm = new StateMachine(this, 'npc' + n)
    this.matrix = { x: 0, y: 0 }
    this.parent = lists

    const behaviorDefaults: DefaultBehaviorProps = {
      name: this.name,
      matrix: this.matrix,
      cooldown: this.cooldown,
      sincePlayerRoom: this.sincePlayerRoom,
      currRoom: this.currRoom,
      currStation: this.currStation,
      addToBehavior: this.addToBehavior.bind(this),
      hp: this.hp,
    }
    //    const behaviorProps:
    this.behavior = {
      place: new Selector([]),
      active: new Selector([]),
      props: {
        effects: { effects: this.effects, traits: this.traits },
        place: {
          clearance: this.clearance,
          clan: this.clan,
          exitRoom: this.exitRoom,
          findRoomPlaceStation: this.findRoomPlaceStation.bind(this),
          ...behaviorDefaults,
        },
        medplace: {
          clearance: this.clearance,
          clan: this.clan,
          exitRoom: this.exitRoom,
          findRoomPlaceStation: this.findRoomPlaceStation.bind(this),
          checkSetStation: this.parent.checkSetStation.bind(this),
          getInfirmed: this.parent.getInfirmed.bind(this),
          getMendingQueue: this.parent.getMendingQueue.bind(this),
          returnMendeeLocation: this.parent.returnMendeeLocation.bind(this),
          ...behaviorDefaults,
        },
        injury: {
          addInjured: this.parent.addInjured.bind(this),
          ...behaviorDefaults,
        },
        mender: {
          returnNpc: this.parent.returnNpc.bind(this),
          getFocusedRoom: this.parent.getFocusedRoom.bind(this),
          ...behaviorDefaults,
        },
        immobile: {
          pruneStationMap: this.parent.pruneStationMap.bind(this),
          ...behaviorDefaults,
        },
        injured: {
          returnNpc: this.parent.returnNpc.bind(this),
          getMendingQueue: this.parent.getMendingQueue.bind(this),
          getOccupants: this.parent.getOccupants.bind(this),
          getIgnore: this.parent.getIgnore.bind(this),
          addAdjustMendingQueue: this.parent.addAdjustMendingQueue.bind(this),

          ...behaviorDefaults,
        },
        helper: {
          clearance: this.clearance,
          clan: this.clan,
          returnNpc: this.parent.returnNpc.bind(this),
          getOccupants: this.parent.getOccupants.bind(this),
          addAdjustMendingQueue: this.parent.addAdjustMendingQueue.bind(this),
          exitRoom: this.exitRoom,
          findRoomPlaceStation: this.findRoomPlaceStation.bind(this),
          makePriorityRoomList: this.makePriorityRoomList.bind(this),
          getMendingQueue: this.parent.getMendingQueue.bind(this),
          ...behaviorDefaults,
        },
        mendee: {
          returnNpc: this.parent.returnNpc.bind(this),
          addIgnore: this.parent.addIgnore.bind(this),
          removeMendee: this.parent.removeMendee.bind(this),
          addAdjustMendingQueue: this.parent.addAdjustMendingQueue.bind(this),
          ...behaviorDefaults,
        },
        infirm: {
          sendToVacancy: this.parent.sendToVacancy.bind(this),
          addInfirmed: this.parent.addInfirmed.bind(this),
          ...behaviorDefaults,
        },
        infirmed: {
          getOccupants: this.parent.getOccupants.bind(this),
          removeInfirmed: this.parent.removeInfirmed.bind(this),
          ...behaviorDefaults,
        },
      },
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
      .addState('trespass', {
        onEnter: this.onTrespassEnter.bind(this),
        onUpdate: this.onTrespassUpdate.bind(this),
        onExit: this.onTrespassExit.bind(this),
      })
      .addState('arrestee', {
        onEnter: this.onArresteeEnter.bind(this),
        onUpdate: this.onArresteeUpdate.bind(this),
        onExit: this.onArresteeExit.bind(this),
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
    this.sincePlayerConvo = novelUpdates.sincePlayerConvo
    this.love = novelUpdates.love
  }
  private onTrespassEnter(): void {
    const hallpass = this.parent.hasHallpass(this.name)
    if (
      hallpass != null &&
      tonumber(hallpass.scope.charAt(hallpass.scope.length - 1))! >=
        RoomsInitState[this.currRoom].clearance
    )
      this.fsm.setState('turn')
  }
  private onTrespassUpdate(): void {
    if (
      this.clearance + math.random(1, 5) >=
      RoomsInitState[this.currRoom].clearance
    )
      this.fsm.setState('turn')
    this.parent.clearStation(this.currRoom, this.currStation, this.name)
    // const target = RoomsInitState[this.parent.getPlayerRoom()].matrix
    // const rooms = this.makePriorityRoomList(target)
    print('findRoomPlaceStation TRESPASS')

    this.findRoomPlaceStation()
  }
  private onTrespassExit(): void {}
  private onArresteeEnter(): void {
    const vacancy = this.parent.sendToVacancy('security', this.name)
    if (vacancy != null) {
      this.parent.clearStation(this.currRoom, this.currStation, this.name)
      this.currStation = vacancy
    }
    this.sincePlayerRoom = 96
    // this.parent.addInfirmed(this.name)
    this.matrix = RoomsInitState.security.matrix
    this.cooldown = 8
    this.currRoom = 'security'
  }
  private onArresteeUpdate(): void {
    this.cooldown--
    if (this.cooldown < 1) this.fsm.setState('turn')
  }
  private onArresteeExit(): void {}
  private onNewEnter(): void {}
  private onNewUpdate(): void {
    this.behavior.place.run()
    print(
      '::: onNewUpdate() ::: 1st b.place.run():: length:',
      this.behavior.place.children.length
    )
  }
  private onNewExit(): void {
    print('npc:', this.name, 'activebehaviorRUN!!!')
    this.behavior.active.run()
    print(
      '::: onNew-EXIT-() ::: 1st b.active.run():: length:',
      this.behavior.active.children.length
    )
    // prettier-ignore
    // print( 'NPCSonPlaceUpdate::: ///states/npcs:: ||| room:', this.currRoom, '| exit:', this.exitRoom, '| name: ', this.name )
  }
  private onTurnEnter(): void {
    print('NPCCLASS::: onTurnEnter()')
  }
  private onTurnUpdate(): void {
    print('TURNUPDATE placerun')
    this.behavior.place.run()
  }
  private onTurnExit(): void {
    print('TURNEXIT ACTIVErun')
    this.behavior.active.run()
  }
  private onActiveEnter(): void {}
  private onActiveUpdate(): void {}
  private onActiveExit(): void {}
  makePriorityRoomList(target: { x: number; y: number }): string[] {
    const npcPriorityProps = {
      matrix: this.matrix,
      home: this.home,
    }
    const npcTurnProps = {
      sincePlayerRoom: this.sincePlayerRoom,
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
  findRoomPlaceStation(t?: { x: number; y: number }, r?: string[]): void {
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
      'findrooomplacestation:: STATION:::',
      chosenRoom,
      chosenStation,
      'exit room:',
      this.exitRoom
    )
    this.currRoom = chosenRoom
    this.parent.setStation(chosenRoom, chosenStation, this.name)
    //this.parent.pruneStationMap(chosenRoom, chosenStation)
    /**testjpf clearance needs complete overhaul
     * make ClearanceSequence
     * !!!
     */
    if (
      RoomsInitState[chosenRoom].clearance >
      this.clearance + math.random(1, 5)
    )
      this.fsm.setState('trespass')
    this.matrix = RoomsInitState[chosenRoom].matrix
    this.currStation = chosenStation
    if (chosenRoom != this.parent.getPlayerRoom()) {
      this.sincePlayerRoom = this.sincePlayerRoom + 1
    } else {
      this.sincePlayerRoom = 0
    }
  }
  addToBehavior(selector: 'place' | 'active', s: Sequence, unshift = false) {
    unshift === false
      ? this.behavior[selector].children.push(s)
      : this.behavior[selector].children.unshift(s)
  }
  getBehaviorProps(behavior: BehaviorKeys): () => ActionProps {
    return () => this.behavior.props[behavior]
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
    let sKey: keyof typeof item.skills
    for (sKey in item.skills)
      this.traits.skills[sKey] = this.traits.skills[sKey] + item.skills[sKey]

    let bKey: keyof typeof item.binaries
    for (bKey in item.binaries)
      this.traits.binaries[bKey] =
        this.traits.binaries[bKey] + item.binaries[bKey]
  }
  addOrExtendEffect(e: Effect) {
    //   let ek: keyof typeof this.effects
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
