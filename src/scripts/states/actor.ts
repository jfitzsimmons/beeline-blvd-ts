/* eslint-disable @typescript-eslint/no-empty-function */
import StateMachine from './stateMachine'
import { Behavior, Traits } from '../../types/state'
import { Effect } from '../../types/tasks'
import { NpcProps, WorldPlayerArgs } from '../../types/world'
import Selector from '../behaviors/selector'

export default class ActorState {
  fsm: StateMachine
  name = ''
  inventory: string[] = []
  // loot: string[] make command object?
  clearance = 0
  cooldown = 0
  convos = 0
  matrix = { x: 0, y: 0 }
  behavior: Behavior
  traits: Traits = {
    opinion: {
      church: 0,
      contractors: 0,
      corps: 0,
      labor: 0,
      security: 0,
      staff: 0,
      visitors: 0,
      sexworkers: 0,
      doctors: 0,
      maintenance: 0,
      custodians: 0,
      mailroom: 0,
      gang1: 0,
      gang2: 0,
      gang3: 0,
      gang4: 0,
    },
    binaries: {
      evil_good: 0,
      passiveAggressive: 0,
      lawlessLawful: 0,
      anti_authority: 0,
      un_educated: 0,
      poor_wealthy: 0,
      mystical_logical: 0,
      noir_color: 0,
    },
    skills: {
      constitution: 5,
      charisma: 5, // deception?
      wisdom: 5,
      intelligence: 5,
      speed: 5,
      perception: 5, // insight
      strength: 5, //carrying capacity, intimidation
      stealth: 5, // !!
    },
  }
  private _hp = 5
  hpMax = 8
  ap = 18
  apMax = 20
  effects: Effect[] = []
  currRoom = 'grounds'
  exitRoom = ''
  race = ''
  parent: NpcProps | WorldPlayerArgs
  constructor(n: string, lists: NpcProps | WorldPlayerArgs) {
    this.fsm = new StateMachine(this, 'actor_' + n)
    this.behavior = {
      place: new Selector([]),
      active: new Selector([]),
    }
    this.parent = lists
  }

  public get hp() {
    return this._hp
  }
  public set hp(p: number) {
    this._hp = p
  }
}
