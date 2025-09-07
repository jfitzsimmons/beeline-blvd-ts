/* eslint-disable @typescript-eslint/no-empty-function */
//import StateMachine from './stateMachine'
import { Unlock, Unlocks } from '../../types/tasks'
import { UnlockInitState } from './inits/questInitState'

export default class WorldUnlocks {
  private _all: Unlocks

  constructor() {
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
