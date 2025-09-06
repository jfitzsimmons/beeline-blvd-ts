/* eslint-disable @typescript-eslint/no-empty-function */
//import StateMachine from './stateMachine'
import { Unlock, Unlocks } from '../../types/tasks'
//import { dispatch } from '../systems/dispatcher'
//import { tutorialQuests } from './inits/quests/tutorialstate'
//import { WorldQuestsMethods } from '../../types/world'
import { UnlockInitState } from './inits/questInitState'

//const dt = math.randomseed(os.time())

/**
 function build_quests_state(questmethods: WorldQuestsMethods): QuestsState {
  return {
    tutorial: tutorialQuests(questmethods),
  }
}
  */
//let q = {}
export default class WorldUnlocks {
  //private _questmethods: WorldQuestsMethods
  //private _all: QuestsState
  private _all: Unlocks

  checkpoint: string
  //fsm: StateMachine

  constructor() {
    // this.fsm = new StateMachine(this, 'quests')
    this.checkpoint = 'tutorialA'

    // this._questmethods = questmethods

    this._all = { ...UnlockInitState }

    this.initUnlock = this.initUnlock.bind(this)
  }

  public get all() {
    return this._all
  }

  //{ name = 'Bobby', age }: Person
  initUnlock(unlock: Unlock) {
    const unlockKey = unlock.id
    this._all[unlockKey] = unlock
  }
}
