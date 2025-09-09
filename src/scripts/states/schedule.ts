/* eslint-disable @typescript-eslint/no-empty-function */
//import StateMachine from './stateMachine'
import { Moment, Moments } from '../../types/tasks'
import { MomentInitState } from './inits/questInitState'

export default class WorldSchedule {
  private _moments: Moments

  constructor() {
    this._moments = { ...MomentInitState }

    this.initMoment = this.initMoment.bind(this)
  }

  public get moments() {
    return this._moments
  }

  initMoment(moment: Moment) {
    const momentKey = moment.id
    this._moments[momentKey] = moment
  }
}
