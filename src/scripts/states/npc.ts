/* eslint-disable @typescript-eslint/no-empty-function */
import { NpcsInitState } from './inits/npcsInitState'
import StateMachine from './stateMachine'
import { Skills } from '../../types/state'
import { Effect } from '../../types/tasks'
import { RoomsInitLayout } from './inits/roomsInitState'

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
  //quests: QuestMethods
  constructor(n: string) {
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

    this.fsm
      .addState('idle')
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
      .addState('arrest', {
        onEnter: this.onArrestEnter.bind(this),
        onUpdate: this.onArrestUpdate.bind(this),
        onExit: this.onArrestExit.bind(this),
      })
      .addState('move', {
        onEnter: this.onMoveEnter.bind(this),
        onUpdate: this.onMoveUpdate.bind(this),
        onExit: this.onMoveExit.bind(this),
      })

    this.fsm.setState('idle')
  }
  private onInjuryStart(): void {}
  private onInjuryUpdate(): void {}
  private onInjuryEnd(): void {}
  private onArrestEnter(): void {}
  private onArrestUpdate(): void {}
  private onArrestExit(): void {}
  private onMoveEnter(): void {
    print(this.labelname, 'has entered MOVE STATE')
  }
  private onMoveUpdate(): void {
    this.exitroom = RoomsInitLayout[this.matrix.y][this.matrix.x]!
    print(this.labelname, 'has UPDATED MOVE STATE', this.exitroom)
  }
  private onMoveExit(): void {
    print(this.labelname, 'has exited move state')
  }
}
