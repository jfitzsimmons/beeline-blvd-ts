/* eslint-disable @typescript-eslint/no-empty-function */
import { NpcsInitState } from './inits/npcsInitState'
import StateMachine from './stateMachine'
import { Skills } from '../../types/state'
import { Effect, NpcMethod } from '../../types/tasks'
import { RoomsInitLayout, RoomsInitState } from './inits/roomsInitState'
import {
  attempt_to_fill_station,
  set_npc_target,
  set_room_priority,
} from '../ai/ai_main'

// need npcs interface?
export default class NpcState {
  fsm: StateMachine
  home: { x: number; y: number }
  labelname: string
  inventory: string[]
  clearence: number
  clan: string
  body: string
  convos: number
  actions: string[]
  ai_path: string
  matrix: { x: number; y: number }
  attitudes: Skills | never
  skills: Skills | never
  binaries: Skills | never
  turns_since_encounter: number
  turns_since_convo: number
  love: number
  hp: number
  cooldown: number
  effects: Effect[]
  currentroom: string
  exitroom: string
  currentstation: string
  race: string
  parent: NpcMethod
  //quests: QuestMethods
  constructor(n: string, lists: NpcMethod) {
    //testjpf npcs need their own statemachine.
    //this._all = { ...NpcsInitState }
    this.home = NpcsInitState[n].home
    this.labelname = NpcsInitState[n].labelname
    this.inventory = NpcsInitState[n].inventory
    this.clearence = NpcsInitState[n].clearence
    this.clan = NpcsInitState[n].clan
    this.body = NpcsInitState[n].body
    this.fsm = new StateMachine(this, 'npc' + n)
    this.convos = 0
    this.actions = ['talk', 'give', 'trade', 'pockets']
    this.ai_path = ''
    this.matrix = { x: 0, y: 0 }
    this.attitudes = {}
    this.skills = {}
    this.binaries = {}
    this.turns_since_encounter = 0
    this.turns_since_convo = 99
    this.love = 0
    this.hp = 5
    this.cooldown = 0
    this.effects = []
    this.currentroom = ''
    this.exitroom = ''
    this.currentstation = ''
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
        onEnter: this.onInfirmStart.bind(this),
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
      .addState('arrestee', {
        onEnter: this.onArresteeEnter.bind(this),
        onUpdate: this.onArresteeUpdate.bind(this),
        onExit: this.onArresteeExit.bind(this),
      })
      .addState('move', {
        onEnter: this.onMoveEnter.bind(this),
        onUpdate: this.onMoveUpdate.bind(this),
        onExit: this.onMoveExit.bind(this),
      })
  }
  private onInfirmStart(): void {
    this.parent.add_infirmed(this.labelname)
  }
  private onInfirmUpdate(): void {}
  private onInfirmEnd(): void {
    this.parent.remove_infirmed(this.labelname)
  }
  private onInjuryStart(): void {
    this.parent.add_injured(this.labelname)
  }
  private onInjuryUpdate(): void {
    this.parent.remove_injured(this.labelname)
  }
  private onInjuryEnd(): void {}
  private onArresteeEnter(): void {}
  private onArresteeUpdate(): void {}
  private onArresteeExit(): void {}
  private onMendeeEnter(): void {}
  private onMendeeUpdate(): void {}
  private onMendeeExit(): void {}
  private onMenderEnter(): void {}
  private onMenderUpdate(): void {}
  private onMenderExit(): void {}
  private onMoveEnter(): void {
    // print(this.labelname, 'has entered MOVE STATE')
  }
  private onMoveUpdate(): void {
    this.exitroom = RoomsInitLayout[this.matrix.y][this.matrix.x]!
    //print(this.labelname, 'has UPDATED MOVE STATE', this.exitroom)

    if (this.hp > 0) {
      this.parent.clear_station(
        this.currentroom,
        this.currentstation,
        this.labelname
      )
      const npcPriorityProps = {
        matrix: this.matrix,
        home: this.home,
        //labelname: this.labelname,
      }
      const npcMoveProps = {
        turns_since_encounter: this.turns_since_encounter,
        ai_path: this.ai_path,
        player: RoomsInitState[this.parent.get_player_room()].matrix,
        ...npcPriorityProps,
      }

      const priorityroomlist = set_room_priority(
        set_npc_target(this.parent.getVicinityTargets(), npcMoveProps),
        npcPriorityProps
      )
      const { chosenRoom, chosenStation } = attempt_to_fill_station(
        priorityroomlist,
        this.labelname,
        this.matrix,
        this.clan,
        this.parent.get_station_map()
      )

      this.currentroom = chosenRoom
      this.parent.set_station(chosenRoom, chosenStation, this.labelname)
      this.matrix = RoomsInitState[chosenRoom].matrix
      this.currentstation = chosenStation
      if (chosenRoom != this.parent.get_player_room()) {
        this.turns_since_encounter = this.turns_since_encounter + 1
      } else {
        this.turns_since_encounter = 0
      }
      //TESTJPFNEXT TODO send roomlist to fillstation!!!
      //move attempt to Rooms class? pass function to npc?!?!
      //accepst room list and this.labelname
      //sets room station agent
      //returns room and station
    } else {
      this.fsm.setState('injury')
    }
    //now need to set station
    //move from ai_main fill station
    //tesjpf
    /**
     * so use ai_main to find new room and station
     * change state and pass room and station?
     */
    this.remove_effects(this.effects)
    if (this.cooldown > 0) this.cooldown = this.cooldown - 1
  }
  private onMoveExit(): void {
    print(this.labelname, 'has exited move state')
  }
  remove_effects_bonus(e: Effect) {
    this[e.fx.type][e.fx.stat] = this[e.fx.type][e.fx.stat] - e.fx.adjustment
  }
  remove_effects(effects: Effect[]) {
    if (effects.length > 0) {
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
}
