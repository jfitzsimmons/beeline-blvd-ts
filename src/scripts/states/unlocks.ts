/* eslint-disable @typescript-eslint/no-empty-function */
///TESTJPF THIS MIGHT NOT BE NEEDED AT ALL DFELETE DELETE
import { Unlocks } from '../../types/state'
//import {  WorldArgs } from '../../types/world'
import { StationsInitState } from './inits/stationsInitState'

//const dt = math.randomseed(os.time())

export default class WorldStations {
  //fsm: StateMachine
  private _all: Unlocks

  //constructor(roomsProps: WorldArgs) {

  constructor() {
    // this.fallbacks = { ...RoomsInitFallbacks }
    //this.layout = [...RoomsInitLayout]
    //this.roles = { ...RoomsInitRoles }

    this._all = StationsInitState
    // this._focused = 'grounds'
  }
  public get all(): Unlocks {
    return this._all
  }

  initStation(station: Unlock) {
    const stationKey = `${station.room}_${station.name}`
    this._all[stationKey] = station
    this.stationsMap[station.room][stationKey] = false
  }
}
/**
 *
 * what does an init unlock look like?
 */
