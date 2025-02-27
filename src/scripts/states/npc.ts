/* eslint-disable @typescript-eslint/no-empty-function */
import { NpcsInitState } from './inits/npcsInitState'
import { RoomsInitState } from './inits/roomsInitState'
import { itemStateInit } from './inits/inventoryInitState'
import { InventoryTableItem } from '../../types/state'
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
  EffectsProps,
  HelperProps,
  ImmobileProps,
  InfirmedProps,
  InfirmProps,
  InjuredProps,
  InjuryProps,
  MedicPlaceProps,
  MendeeProps,
  MenderProps,
  PlaceProps,
} from '../../types/behaviors'
//import InjuredSequence from '../behaviors/sequences/injuredSequence'

//const dt = math.randomseed(os.time())

export default class NpcState extends ActorState {
  home: { x: number; y: number }
  clan: string
  body: string
  love = 0
  currStation = ''
  parent: NpcProps
  convos = 0
  actions: string[] = ['talk', 'give', 'trade', 'pockets']
  aiPath = ''
  sincePlayerRoom = 0
  sincePlayerConvo = 99
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
    this.fsm
      .addState('idle')
      .addState('infirm', {
        onEnter: this.onInfirmEnter.bind(this),
        onUpdate: this.onInfirmUpdate.bind(this),
        onExit: this.onInfirmEnd.bind(this),
      })
      .addState('injury', {
        onEnter: this.onInjuryStart.bind(this),
        onUpdate: this.onInjuryUpdate.bind(this),
        onExit: this.onInjuryEnd.bind(this),
      })
      .addState('erfull', {
        onEnter: this.onERfullEnter.bind(this),
        onUpdate: this.onERfullUpdate.bind(this),
        onExit: this.onERfullExit.bind(this),
      })
      .addState('paramedic', {
        onEnter: this.onParamedicEnter.bind(this),
        onUpdate: this.onParamedicUpdate.bind(this),
        onExit: this.onParamedicExit.bind(this),
      })
      .addState('mendee', {
        onEnter: this.onMendeeEnter.bind(this),
        onUpdate: this.onMendeeUpdate.bind(this),
        onExit: this.onMendeeExit.bind(this),
      })
      .addState('mender', {
        onEnter: this.onMenderEnter.bind(this),
        onUpdate: this.onMenderUpdate.bind(this),
        onExit: this.onMenderExit.bind(this),
      })
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
    this.tendToPatient = this.tendToPatient.bind(this)
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

  private onInfirmEnter(): void {}
  private onInfirmUpdate(): void {}
  private onInfirmEnd(): void {
    this.parent.removeInfirmed(this.name)
    this.parent.removeInjured(this.name)
    this.parent.removeIgnore(this.name)
  }
  private onInjuryStart(): void {
    //this.sincePlayerRoom = 99
    //this.parent.addInjured(this.name)
    //this.hp = 0
  }
  private onInjuryUpdate(): void {}
  private onInjuryEnd(): void {}
  private onParamedicEnter(): void {}
  private onParamedicUpdate(): void {}
  private onParamedicExit(): void {}
  private onERfullEnter(): void {}
  private onERfullUpdate(): void {}
  private onERfullExit(): void {}
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
  private onMendeeEnter(): void {}
  private onMendeeUpdate(): void {}
  private onMendeeExit(): void {}
  private onMenderEnter(): void {}
  private onMenderUpdate(): void {}
  private onMenderExit(): void {}
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
    // print( 'NPCSonPlaceUpdate::: ///states/npcs:: ||| room:', npc.currRoom, '| station:', npc.currStation, '| name: ', npc.name )
    // }
  }
  private onTurnEnter(): void {
    print('NPCCLASS::: onTurnEnter()')
  }
  private onTurnUpdate(): void {
    print('TURNUPDATE place run')

    this.behavior.place.run()
  }
  private onTurnExit(): void {
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

    this.parent.clearStation(this.currRoom, this.currStation, this.name)
    const { chosenRoom, chosenStation } = fillStationAttempt(
      rooms,
      this.name,
      this.matrix,
      this.clan,
      this.parent.getStationMap()
    )
    print('findrooomplacestation:: STATION:::', chosenRoom, chosenStation)
    this.currRoom = chosenRoom
    this.parent.setStation(chosenRoom, chosenStation, this.name)
    //this.parent.pruneStationMap(chosenRoom, chosenStation)

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
  getBehaviorProps(behavior: BehaviorKeys): ActionProps | EffectsProps {
    /**
    const defaultProps = {
      name: this.name,
      clan: this.clan,
      effects: this.effects,
      traits: this.traits,
      cooldown: this.cooldown,
      exitRoom: this.exitRoom,
      matrix: this.matrix,
      sincePlayerRoom: this.sincePlayerRoom,
      addToBehavior: this.addToBehavior.bind(this),
    }
    const placeProps: ActionProps = {
      ...(behavior == 'place' && { defaultProps }),
    }
      */
    const defaults: DefaultBehaviorProps = {
      name: this.name,
      matrix: this.matrix,
      cooldown: this.cooldown,
      sincePlayerRoom: this.sincePlayerRoom,
      currRoom: this.currRoom,
      currStation: this.currStation,
      addToBehavior: this.addToBehavior.bind(this),
      hp: this.hp,
    }
    const props: {
      effects: EffectsProps
      place: PlaceProps
      medplace: MedicPlaceProps
      injury: InjuryProps
      mender: MenderProps
      immobile: ImmobileProps
      injured: InjuredProps
      mendee: MendeeProps
      infirm: InfirmProps
      infirmed: InfirmedProps
      helper: HelperProps
    } = {
      effects: { effects: this.effects, traits: this.traits },
      place: {
        clan: this.clan,
        exitRoom: this.exitRoom,
        findRoomPlaceStation: this.findRoomPlaceStation.bind(this),
        ...defaults,
      },
      medplace: {
        clan: this.clan,
        exitRoom: this.exitRoom,
        findRoomPlaceStation: this.findRoomPlaceStation.bind(this),
        checkSetStation: this.parent.checkSetStation.bind(this),
        getInfirmed: this.parent.getInfirmed.bind(this),
        getMendingQueue: this.parent.getMendingQueue.bind(this),
        returnMendeeLocation: this.parent.returnMendeeLocation.bind(this),
        ...defaults,
      },
      injury: {
        addInjured: this.parent.addInjured.bind(this),
        ...defaults,
      },
      mender: {
        returnNpc: this.parent.returnNpc.bind(this),
        getFocusedRoom: this.parent.getFocusedRoom.bind(this),
        ...defaults,
      },
      immobile: {
        pruneStationMap: this.parent.pruneStationMap.bind(this),
        ...defaults,
      },
      injured: {
        returnNpc: this.parent.returnNpc.bind(this),
        getMendingQueue: this.parent.getMendingQueue.bind(this),
        getOccupants: this.parent.getOccupants.bind(this),
        getIgnore: this.parent.getIgnore.bind(this),
        addAdjustMendingQueue: this.parent.addAdjustMendingQueue.bind(this),

        ...defaults,
      },
      helper: {
        clan: this.clan,
        returnNpc: this.parent.returnNpc.bind(this),
        getOccupants: this.parent.getOccupants.bind(this),
        addAdjustMendingQueue: this.parent.addAdjustMendingQueue.bind(this),
        exitRoom: this.exitRoom,
        findRoomPlaceStation: this.findRoomPlaceStation.bind(this),
        makePriorityRoomList: this.makePriorityRoomList.bind(this),
        getMendingQueue: this.parent.getMendingQueue.bind(this),
        ...defaults,
      },
      mendee: {
        returnNpc: this.parent.returnNpc.bind(this),
        addIgnore: this.parent.addIgnore.bind(this),
        removeMendee: this.parent.removeMendee.bind(this),
        addAdjustMendingQueue: this.parent.addAdjustMendingQueue.bind(this),
        ...defaults,
      },
      infirm: {
        sendToVacancy: this.parent.sendToVacancy.bind(this),
        addInfirmed: this.parent.addInfirmed.bind(this),
        ...defaults,
      },
      infirmed: {
        isStationedTogether: this.parent.isStationedTogether.bind(this),
        removeInfirmed: this.parent.removeInfirmed.bind(this),
        ...defaults,
      },
    }

    /**
    Object.assign(
      props,
      behavior == 'place' && { placeProps },
      behavior == 'effects' && { effectsProps },
      behavior == 'medplace' && { medProps },
      behavior == 'injury' && { injuryProps },
      behavior == 'mender' && { menderProps },
      behavior == 'immobile' && { immobileProps },
      behavior == 'injured' && { injuredProps },
      behavior == 'mendee' && { mendeeProps },
      behavior == 'infirm' && { infirmProps },
      behavior == 'infirmed' && { infirmedProps }
    )
      */
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    return { ...props[behavior], ...defaults } as ActionProps
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
  tendToPatient(p: string, doc: string) {
    this.parent.returnNpc(doc).fsm.setState('mender')
    this.parent.returnNpc(p).fsm.setState('mendee')
    //tasks.removeHeat(p)
    this.parent.taskBuilder(doc, 'mender', p, 'injury')
  }
}
