/* eslint-disable @typescript-eslint/no-empty-function */
import { NpcsInitState } from './inits/npcsInitState'
import StateMachine from './stateMachine'
import { InventoryTableItem, Skills } from '../../types/state'
import { Effect, NpcMethod } from '../../types/tasks'
import {
  RoomsInitLayout,
  RoomsInitPriority,
  RoomsInitState,
} from './inits/roomsInitState'
import { itemStateInit } from './inits/inventoryInitState'
import {
  attempt_to_fillStation,
  set_room_priority,
  set_npc_target,
} from '../utils/ai'
import { surrounding_room_matrix } from '../utils/utils'

// need npcs interface?
export default class NpcState {
  fsm: StateMachine
  home: { x: number; y: number }
  name: string
  inventory: string[]
  clearance: number
  clan: string
  body: string
  convos: number
  actions: string[]
  ai_path: string
  matrix: { x: number; y: number }
  opinion: Skills | never
  skills: Skills | never
  binaries: Skills | never
  turns_since_encounter: number
  turns_since_convo: number
  love: number
  hp: number
  cooldown: number
  effects: Effect[]
  currRoom: string
  exitRoom: string
  currStation: string
  race: string
  parent: NpcMethod
  //quests: QuestMethods
  constructor(n: string, lists: NpcMethod) {
    //testjpf npcs need their own statemachine.
    //this._all = { ...NpcsInitState }
    this.home = NpcsInitState[n].home
    this.name = NpcsInitState[n].name
    this.inventory = NpcsInitState[n].inventory
    this.clearance = NpcsInitState[n].clearance
    this.clan = NpcsInitState[n].clan
    this.body = NpcsInitState[n].body
    this.fsm = new StateMachine(this, 'npc' + n)
    this.convos = 0
    this.actions = ['talk', 'give', 'trade', 'pockets']
    this.ai_path = ''
    this.matrix = { x: 0, y: 0 }
    this.opinion = {}
    this.skills = {}
    this.binaries = {}
    this.turns_since_encounter = 0
    this.turns_since_convo = 99
    this.love = 0
    this.hp = 5
    this.cooldown = 0
    this.effects = []
    this.currRoom = ''
    this.exitRoom = ''
    this.currStation = ''
    this.race = ''
    this.parent = lists

    this.fsm
      .addState('idle')
      .addState('infirm', {
        //game??
        //onInit?
        // what more could i do beside adjust cool downs
        // can i access any other systems?? testjpf
        //how to use instead of cautions?
        // adjust stats? add remove bonuses/
        //on update could be like onInteraction.
        // if you talk to or rob someone in that state x will happen?
        //should i be using script.ts?!?!?!
        // need to go through what could happen on an Aio_turn
        // maybbe interation too? / the if elses
        // keep .update in mind.  everything needs a .update
        onEnter: this.onInfirmEnter.bind(this),
        onUpdate: this.onInfirmUpdate.bind(this),
        onExit: this.onInfirmEnd.bind(this),
      })
      .addState('injury', {
        //game??
        //onInit?
        // what more could i do beside adjust cool downs
        // can i access any other systems?? testjpf
        //how to use instead of cautions?
        // adjust stats? add remove bonuses/
        //on update could be like onInteraction.
        // if you talk to or rob someone in that state x will happen?
        //should i be using script.ts?!?!?!
        // need to go through what could happen on an Aio_turn
        // maybbe interation too? / the if elses
        // keep .update in mind.  everything needs a .update
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
      .addState('interrogate', {
        onEnter: this.onInterrogateEnter.bind(this),
        onUpdate: this.onInterrogateUpdate.bind(this),
        onExit: this.onInterrogateExit.bind(this),
      })
      .addState('questioned', {
        onEnter: this.onQuestionedEnter.bind(this),
        onUpdate: this.onQuestionedUpdate.bind(this),
        onExit: this.onQuestionedExit.bind(this),
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
  }
  private onQuestionedEnter(): void {}
  private onQuestionedUpdate(): void {}
  private onQuestionedExit(): void {}
  private onInterrogateEnter(): void {}
  private onInterrogateUpdate(): void {}
  private onInterrogateExit(): void {}
  private onInfirmEnter(): void {
    this.hp = 5
    this.parent.clearStation(this.currRoom, this.currStation, this.name)
    this.turns_since_encounter = 99
    this.parent.add_infirmed(this.name)
    this.matrix = RoomsInitState.infirmary.matrix
    this.cooldown = 8
    this.currRoom = 'infirmary'
  }
  private onInfirmUpdate(): void {
    this.turns_since_encounter = 99
    this.parent.isStationedTogether(
      ['doc03', 'doc02', 'doc01'],
      'infirmary'
    ) === true
      ? (this.hp = this.hp + 2)
      : (this.hp = this.hp + 1)

    if (this.hp > 9) this.fsm.setState('turn')
  }
  private onInfirmEnd(): void {
    this.parent.remove_infirmed(this.name)
    this.parent.remove_injured(this.name)
    this.parent.remove_ignore(this.name)
  }
  private onInjuryStart(): void {
    this.turns_since_encounter = 99
    this.parent.add_injured(this.name)
    this.hp = 0
  }
  private onInjuryUpdate(): void {
    this.turns_since_encounter = 99
    this.parent.pruneStationMap(this.currRoom, this.currStation)
  }
  private onInjuryEnd(): void {
    // this.parent.remove_injured(this.name)
  }
  private onParamedicEnter(): void {}
  private onParamedicUpdate(): void {
    if (this.parent.getMendingQueue().length < 1) {
      this.fsm.setState('turn')
      return
    }
    const target = RoomsInitState[this.parent.returnMendeeLocation()].matrix
    const rooms = this.makePriorityRoomList(target)
    this.findRoomPlaceStation(rooms)
  }
  private onParamedicExit(): void {}

  private onERfullEnter(): void {}
  private onERfullUpdate(): void {
    this.turns_since_encounter = 97
    const patients = this.parent.get_infirmed()

    if (math.random() + patients.length * 0.2 > 1) {
      this.clearStation()
      this.parent.setStation('infirmary', 'aid', this.name)
      this.parent.pruneStationMap('infirmary', 'aid')
    } else if (patients.length > 3) {
      const target = RoomsInitState.infirmary.matrix
      const rooms = this.makePriorityRoomList(target)
      this.findRoomPlaceStation(rooms)
      if (this.parent.get_infirmed().length < 2) this.fsm.setState('turn')
      //Force Doc to infirmary if overwhelmed
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
    //tesjpfremove hardcode
    // if randomly caught randomly sets to turn
    // need to re-place npc
    if (
      this.clearance + math.random(1, 5) >=
      RoomsInitState[this.currRoom].clearance
    )
      this.fsm.setState('turn')
    this.clearStation()
    const target = RoomsInitState[this.parent.getPlayerRoom()].matrix
    const rooms = this.makePriorityRoomList(target)
    this.findRoomPlaceStation(rooms)
  }
  private onTrespassExit(): void {}
  private onArresteeEnter(): void {}
  private onArresteeUpdate(): void {}
  private onArresteeExit(): void {}
  private onMendeeEnter(): void {
    this.turns_since_encounter = 98
    this.parent.add_ignore(this.name)
    //testjpf need to remove injury tasks
  }
  private onMendeeUpdate(): void {
    this.turns_since_encounter = 98
    //print('MENDEEUP::: hp', this.hp)
    this.hp = this.hp + 1
    if (this.hp > 4) {
      const vacancy = this.parent.sendToInfirmary(this.name)
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
    this.turns_since_encounter = 98
  }
  private onMenderUpdate(): void {
    this.turns_since_encounter = 98
    //call func with current room as parameter
    //if same as palyer room!!
    this.parent.pruneStationMap(this.currRoom, this.currStation)
  }
  private onMenderExit(): void {
    // this.parent.remove_ignore(this.name)
  }
  private onNewEnter(): void {
    if (this.hp > 0) {
      this.findRoomPlaceStation(RoomsInitPriority)
    } else {
      this.fsm.setState('injury')
    }
  }
  private onNewUpdate(): void {
    this.fsm.setState('turn')
  }
  private onNewExit(): void {}
  private onTurnEnter(): void {
    // print(this.name, 'has entered MOVE STATE')
  }
  private onTurnUpdate(): void {
    this.exitRoom = RoomsInitLayout[this.matrix.y][this.matrix.x]!
    this.remove_effects(this.effects)
    if (this.cooldown > 0) this.cooldown = this.cooldown - 1
    if (this.hp < 1) {
      this.fsm.setState('injury')
      return
    }
    this.clearStation()
    const target = RoomsInitState[this.parent.getPlayerRoom()].matrix
    const rooms = this.makePriorityRoomList(target)
    this.findRoomPlaceStation(rooms)
  }
  private onTurnExit(): void {
    print(this.name, 'has exited move state')
  }

  clearStation() {
    this.parent.clearStation(this.currRoom, this.currStation, this.name)
  }
  makePriorityRoomList(target: { x: number; y: number }): string[] {
    const npcPriorityProps = {
      matrix: this.matrix,
      home: this.home,
    }
    const npcTurnProps = {
      turns_since_encounter: this.turns_since_encounter,
      ai_path: this.ai_path,
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
    //for (const test of rooms) print('TESTTOOMS ROOM:: ', test)
    const { chosenRoom, chosenStation } = attempt_to_fillStation(
      rooms,
      this.name,
      this.matrix,
      this.clan,
      this.parent.getStationMap()
    )

    this.currRoom = chosenRoom
    this.parent.setStation(chosenRoom, chosenStation, this.name)
    this.parent.pruneStationMap(chosenRoom, chosenStation)

    if (
      RoomsInitState[chosenRoom].clearance >
      this.clearance + math.random(1, 5)
    )
      this.fsm.setState('trespass')
    //testjpf replace debug hardcode
    this.matrix = RoomsInitState[chosenRoom].matrix
    this.currStation = chosenStation
    if (chosenRoom != this.parent.getPlayerRoom()) {
      this.turns_since_encounter = this.turns_since_encounter + 1
    } else {
      this.turns_since_encounter = 0
    }
  }
  removeInvBonus(i: string) {
    const item: InventoryTableItem = itemStateInit[i]
    let sKey: keyof typeof item.skills
    for (sKey in itemStateInit[i].skills)
      this.skills[sKey] = this.skills[sKey] - itemStateInit[i].skills[sKey]

    let bKey: keyof typeof item.binaries
    for (bKey in itemStateInit[i].binaries)
      this.binaries[bKey] =
        this.binaries[bKey] - itemStateInit[i].binaries[bKey]
  }

  addInvBonus(i: string) {
    const item: InventoryTableItem = itemStateInit[i]
    let sKey: keyof typeof item.skills
    for (sKey in itemStateInit[i].skills)
      this.skills[sKey] = this.skills[sKey] + itemStateInit[i].skills[sKey]

    let bKey: keyof typeof item.binaries
    for (bKey in itemStateInit[i].binaries)
      this.binaries[bKey] =
        this.binaries[bKey] + itemStateInit[i].binaries[bKey]
  }
  remove_effects_bonus(e: Effect) {
    this[e.fx.type][e.fx.stat] = this[e.fx.type][e.fx.stat] - e.fx.adjustment
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
}
