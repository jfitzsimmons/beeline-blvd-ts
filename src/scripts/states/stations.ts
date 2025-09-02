/* eslint-disable @typescript-eslint/no-empty-function */

import StateMachine from './stateMachine'
import { Stations, Station } from '../../types/state'
//import {  WorldArgs } from '../../types/world'
import { StationsInitState } from './inits/stationsInitState'

//const dt = math.randomseed(os.time())

export default class WorldStations {
  fsm: StateMachine
  private _all: Stations
  //layout: Array<Array<string | null>>
  //roles: Roles
  // private _focused: string
  //fallbacks: Fallbacks
  stationsMap: {
    [key: string]: { [key: string]: boolean }
  }
  //constructor(roomsProps: WorldArgs) {

  constructor() {
    this.fsm = new StateMachine(this, 'rooms')
    // this.fallbacks = { ...RoomsInitFallbacks }
    //this.layout = [...RoomsInitLayout]
    //this.roles = { ...RoomsInitRoles }

    this._all = StationsInitState
    // this._focused = 'grounds'
    this.stationsMap = {}
    this.fsm
      .addState('idle')
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
    this.initStation = this.initStation.bind(this)
    this.clearStation = this.clearStation.bind(this)
    this.setStation = this.setStation.bind(this)
    this.pruneStationMap = this.pruneStationMap.bind(this)
    this.getStationMap = this.getStationMap.bind(this)
    this.checkSetStation = this.checkSetStation.bind(this)
    this.resetStationMap = this.resetStationMap.bind(this)
  }
  public get all(): Stations {
    return this._all
  }

  pruneStationMap(stationKey: string) {
    const room = stationKey.split('_')[0]
    this.stationsMap[room][stationKey] = true
    if (this._all[stationKey].swap == undefined) return

    const swap = this._all[stationKey].swap
    this.stationsMap[room][swap] = true
  }
  getStationMap(): {
    [key: string]: { [key: string]: boolean }
  } {
    return this.stationsMap
  }
  resetStationMap() {
    let rk: keyof typeof this.stationsMap
    for (rk in this.stationsMap) {
      const room = this.stationsMap[rk]
      let sk: keyof typeof room
      for (sk in this.stationsMap[rk]) this.stationsMap[rk][sk] = false
    }
  }

  checkSetStation(stationKey: string, npc: string): boolean {
    const room = stationKey.split('_')[0]

    const map = this.getStationMap()
    if (map[room][stationKey] == false) {
      this.setStation(stationKey, npc)
      return true
    }
    return false
  }
  setStation(station: string, npc: string) {
    // this._all[station] !== null
    this._all[station].occupant = npc

    this.pruneStationMap(station)
  }

  clearStation(station: string, npc: string) {
    // if (room === '') return
    if (npc == this._all[station].occupant) this._all[station].occupant = ''
  }

  private onTurnEnter(): void {
    this.resetStationMap()
  }
  private onTurnUpdate(): void {
    this.resetStationMap()
    /**
     * TESTJPF
     * do i wnat to give fsms to individual stations?
     * could come in handy maybe
    let kr: keyof typeof this._all
    for (kr in this._all) this._all[kr].fsm.update(dt)
    **/
  }
  private onTurnExit(): void {}
  private onNewEnter(): void {}
  private onNewUpdate(): void {}
  private onNewExit(): void {}
  /**
   * 
   *  testjpf
   * ne something like getByRoomTag
   * get by type tag
   * get by station stag
   * 
   
  getWards(room: string): string[] {
    return Object.values(this._all[room].wards!).filter((s) => s !== '')
  }
    */
  clearStations() {
    this._all = {}
    this.stationsMap = {}
  }
  initStation(station: Station) {
    const stationKey = `${station.room}_${station.name}`
    this._all[stationKey] = station
    this.stationsMap[station.room][stationKey] = false
  }
}
