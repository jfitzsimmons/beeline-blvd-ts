/* eslint-disable @typescript-eslint/no-empty-function */
import { NpcsInitState } from './inits/npcsInitState'
import { RoomsInitState } from './inits/roomsInitState'
import { itemStateInit } from './inits/inventoryInitState'
//import StateMachine from './stateMachine'
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
import { doctors } from '../utils/consts'
import ActorState from './actor'

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

  private onInfirmEnter(): void {
    this.hp = 5
    this.parent.clearStation(this.currRoom, this.currStation, this.name)
    this.sincePlayerRoom = 99
    this.parent.addInfirmed(this.name)
    this.matrix = RoomsInitState.infirmary.matrix
    this.cooldown = 8
    this.currRoom = 'infirmary'
  }
  private onInfirmUpdate(): void {
    this.sincePlayerRoom = 99
    this.parent.isStationedTogether(doctors, 'infirmary') === true
      ? (this.hp = this.hp + 2)
      : (this.hp = this.hp + 1)

    if (this.hp > 9) this.fsm.setState('turn')
  }
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
  private onParamedicUpdate(): void {
    const target = RoomsInitState[this.parent.returnMendeeLocation()!].matrix
    const rooms = this.makePriorityRoomList(target)
    this.parent.clearStation(this.currRoom, this.currStation, this.name)

    this.findRoomPlaceStation(rooms)
    // if (this.parent.getMendingQueue().length < 1) {
    //   this.fsm.setState('turn')
    //   return
    // }
  }
  private onParamedicExit(): void {}
  private onERfullEnter(): void {}
  private onERfullUpdate(): void {
    this.sincePlayerRoom = 97
    const patients = this.parent.getInfirmed()
    this.parent.clearStation(this.currRoom, this.currStation, this.name)

    if (
      math.random() + patients.length * 0.2 > 1 &&
      this.parent.getStationMap().infirmary.aid !== undefined
    ) {
      this.parent.setStation('infirmary', 'aid', this.name)
      this.parent.pruneStationMap('infirmary', 'aid')
    } else if (patients.length > 2) {
      const target = RoomsInitState.infirmary.matrix
      const rooms = this.makePriorityRoomList(target)
      this.findRoomPlaceStation(rooms)
    }
  }
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
    const target = RoomsInitState[this.parent.getPlayerRoom()].matrix
    const rooms = this.makePriorityRoomList(target)
    this.findRoomPlaceStation(rooms)
  }
  private onTrespassExit(): void {}
  private onArresteeEnter(): void {
    const vacancy = this.parent.sendToVacancy('security', this.name)
    if (vacancy != null) {
      this.parent.clearStation(this.currRoom, this.currStation, this.name)
      this.currStation = vacancy
    }
    this.sincePlayerRoom = 96
    this.parent.addInfirmed(this.name)
    this.matrix = RoomsInitState.security.matrix
    this.cooldown = 8
    this.currRoom = 'security'
  }
  private onArresteeUpdate(): void {
    this.cooldown--
    if (this.cooldown < 1) this.fsm.setState('turn')
  }
  private onArresteeExit(): void {}
  private onMendeeEnter(): void {
    this.sincePlayerRoom = 98
    this.parent.addIgnore(this.name)
    this.parent.addAdjustMendingQueue(this.name)
  }
  private onMendeeUpdate(): void {
    this.sincePlayerRoom = 98
    this.hp = this.hp + 1
    if (this.hp > 4) {
      const vacancy = this.parent.sendToVacancy('infirmary', this.name)
      if (vacancy != null) {
        this.currStation = vacancy
        this.fsm.setState('infirm')
      }
    } else {
      this.parent.pruneStationMap(this.currRoom, this.currStation)
    }
  }
  private onMendeeExit(): void {
    this.parent.clearStation(this.currRoom, this.currStation, this.name)
  }
  private onMenderEnter(): void {
    //this.sincePlayerRoom = 97
  }
  private onMenderUpdate(): void {
    // this.sincePlayerRoom = 97
    // this.parent.pruneStationMap(this.currRoom, this.currStation)
  }
  private onMenderExit(): void {}
  private onNewEnter(): void {}
  private onNewUpdate(): void {
    print('NEWUPDATE place run')

    this.behavior.place.run()
  }
  private onNewExit(): void {}
  private onTurnEnter(): void {
    this.sincePlayerRoom = math.random(2, 15)
  }
  private onTurnUpdate(): void {
    /**
     * TESTJPF
     * so instead we will access this.behaviors
     * ...
     * is this it's own sequence???
     */
    // this.exitRoom = RoomsInitLayout[this.matrix.y][this.matrix.x]!
    //this.remove_effects(this.effects)
    //if (this.cooldown > 0) this.cooldown = this.cooldown - 1
    //if (this.hp < 1) {
    //  this.fsm.setState('injury')
    // return
    //}
    // this.parent.clearStation(this.currRoom, this.currStation, this.name)

    //const target = RoomsInitState[this.parent.getPlayerRoom()].//matrix
    //const rooms = this.makePriorityRoomList(target)
    // this.findRoomPlaceStation(rooms)
    /**
     * TESTJPF the circular ref error
     * should be solved if you move pushing turnseq
     * to somewhere else.
     *
     * I think a huge question is
     * whether i need to consider PLAYER
     * at all!!!
     */
    print('TURNUPDATE place run')

    this.behavior.place.run()

    // loop thru behVIORS AS TEST!!!
    //testjpf STARTHERE h
  }
  private onTurnExit(): void {}
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
  findRoomPlaceStation(rooms: string[]): void {
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
    this.parent.pruneStationMap(chosenRoom, chosenStation)

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
    for (const effect of effects) {
      if (effect.turns < 0) {
        this.remove_effects_bonus(effect)
        effects.splice(effects.indexOf(effect), 1)
      } else {
        effect.turns = effect.turns - 1
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
