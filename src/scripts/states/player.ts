/* eslint-disable @typescript-eslint/no-empty-function */
import { InventoryTableItem, PlayerState, Skills } from '../../types/state'
import { QuestMethods, WorldPlayerProps } from '../../types/tasks'
import { PlayerInitState } from './inits/playerInitState'
import { shuffle } from '../utils/utils'
import { RoomsInitLayout, RoomsInitState } from './inits/roomsInitState'
import StateMachine from './stateMachine'
import { itemStateInit } from './inits/inventoryInitState'

function randomSkills(skills: Skills, bins: Skills) {
  let tempvals: number[] = shuffle([1, 1, 3, 4, 5, 6, 6, 7])
  let count = 0
  let ks: keyof typeof skills // Type is "one" | "two" | "three"
  for (ks in skills) {
    skills[ks] = tempvals[count] + math.random(-1, 1)
    count++
  }

  tempvals = shuffle([-0.5, 0.5, -0.1, 0.1, -0.2, 0.2, -0.3, 0.3])
  count = 0
  let kb: keyof typeof bins // Type is "one" | "two" | "three"
  for (kb in bins) {
    bins[kb] = tempvals[count] + math.random(-0.2, 0.2)
    count++
  }
}

export default class WorldPlayer {
  private _state: PlayerState
  fsm: StateMachine
  quests: QuestMethods
  parent: WorldPlayerProps

  constructor(playerProps: WorldPlayerProps) {
    this.fsm = new StateMachine(this, 'player')
    this._state = { ...PlayerInitState }
    randomSkills(this._state.traits.skills, this._state.traits.binaries)
    this.quests = {
      return_inventory: this.return_inventory.bind(this),
      return_skills: this.return_skills.bind(this),
      return_playerroom: this.return_playerroom.bind(this),
    }
    this.parent = playerProps
    this.inventory_init()
    this.fsm
      .addState('idle')
      .addState('turn', {
        onEnter: this.onTurnEnter.bind(this),
        onUpdate: this.onTurnUpdate.bind(this),
        onExit: this.onTurnExit.bind(this),
      })
      .addState('trespass', {
        onEnter: this.onTrespassEnter.bind(this),
        onUpdate: this.onTrespassUpdate.bind(this),
        onExit: this.onTrespassExit.bind(this),
      })
      .addState('questioned', {
        onEnter: this.onQuestionedEnter.bind(this),
        onUpdate: this.onQuestionedUpdate.bind(this),
        onExit: this.onQuestionedExit.bind(this),
      })
    this.addToAlertLevel = this.addToAlertLevel.bind(this)
    this.getPlayerRoom = this.getPlayerRoom.bind(this)
    this.setRoomInfo = this.setRoomInfo.bind(this)
  }
  private onTurnEnter(): void {
    print('PLAYER entered Turn STATE')
  }
  private onTurnUpdate(): void {
    //todo
    print('PLAYER UPDATE FSM')
    this.ap = this.ap - 1
    this.turns = this.turns + 1
    this.setRoomInfo()
  }
  private onTurnExit(): void {
    // print(this.name, 'has entered MOVE STATE')
  }
  private onTrespassEnter(): void {
    const hallpass = this.parent.hasHallpass('player')
    if (
      hallpass != null &&
      tonumber(hallpass.scope.charAt(hallpass.scope.length - 1))! >=
        RoomsInitState[this.currRoom].clearance
    )
      this.fsm.setState('turn')
  }
  private onTrespassUpdate(): void {
    this.ap = this.ap - 1
    this.turns = this.turns + 1
    this.setRoomInfo()
    if (this.clearance >= RoomsInitState[this.currRoom].clearance)
      this.fsm.setState('turn')
  }
  private onTrespassExit(): void {
    this.parent.removeTaskByCause('player', 'clearance')
  }
  private onQuestionedEnter(): void {
    // print('TESTJPF: PLAYER Entering question state does nothing.')
    //  this.fsm.setState('turn')
  }
  private onQuestionedUpdate(): void {}
  private onQuestionedExit(): void {}
  setRoomInfo() {
    //testjpf instead will have parent.get_focused_room()
    //or something...
    print(
      '00 focusroomchanges:: current, matrik:',
      this.parent.getFocusedRoom(),
      this.exitRoom,
      this.currRoom,
      this.matrix_x,
      this.matrix_y
    )
    this.exitRoom = RoomsInitLayout[this.matrix_y][this.matrix_x]!
    this.currRoom = this.parent.getFocusedRoom()
    this.matrix = RoomsInitState[this.currRoom].matrix
    print(
      'focusroomchanges:: current, matrik:',
      this.parent.getFocusedRoom(),
      this.exitRoom,
      this.currRoom,
      this.matrix_x,
      this.matrix_y
    )
  }
  getPlayerRoom(): string {
    return this.currRoom
  }
  removeInvBonus(i: string) {
    const item: InventoryTableItem = itemStateInit[i]
    let sKey: keyof typeof item.skills
    for (sKey in itemStateInit[i].skills)
      this.state.traits.skills[sKey] =
        this.state.traits.skills[sKey] - itemStateInit[i].skills[sKey]

    let bKey: keyof typeof item.binaries
    for (bKey in itemStateInit[i].binaries)
      this.state.traits.binaries[bKey] =
        this.state.traits.binaries[bKey] - itemStateInit[i].binaries[bKey]
  }

  addInvBonus(i: string) {
    const item: InventoryTableItem = itemStateInit[i]
    let sKey: keyof typeof item.skills
    for (sKey in itemStateInit[i].skills)
      this.state.traits.skills[sKey] =
        this.state.traits.skills[sKey] + itemStateInit[i].skills[sKey]

    let bKey: keyof typeof item.binaries
    for (bKey in itemStateInit[i].binaries)
      this.state.traits.binaries[bKey] =
        this.state.traits.binaries[bKey] + itemStateInit[i].binaries[bKey]
  }
  public set pos(p: { x: number; y: number }) {
    this._state.pos = p
  }
  public get pos() {
    return this._state.pos
  }
  public get state() {
    return this._state
  }
  public set inventory(i: string[]) {
    this._state.inventory = i
  }
  public get inventory() {
    return this._state.inventory
  }
  public set clearance(c: number) {
    this._state.clearance = c
  }
  public get clearance() {
    return this._state.clearance
  }
  public set hp(n: number) {
    this._state.hp = n
  }
  public get hp() {
    return this._state.hp
  }
  public set heat(h: number) {
    this._state.heat = h
  }
  public get heat() {
    return this._state.heat
  }
  public set ap(n: number) {
    this._state.ap = n
  }
  public get ap() {
    return this._state.ap
  }
  public set hp_max(n: number) {
    this._state.hp_max = n
  }
  public get hp_max() {
    return this._state.hp_max
  }
  public set ap_max(n: number) {
    this._state.ap_max = n
  }
  public get ap_max() {
    return this._state.ap_max
  }
  public set currRoom(r: string) {
    this._state.currRoom = r
  }
  public get currRoom(): string {
    return this._state.currRoom
  }

  public set turns(n: number) {
    this._state.turns = n
  }
  public get turns() {
    return this._state.turns
  }
  public set exitRoom(r: string) {
    this._state.exitRoom = r
  }
  public get exitRoom() {
    return this._state.exitRoom
  }
  public get alert_level() {
    return this._state.alert_level
  }
  public set alert_level(n: number) {
    this._state.alert_level = n
  }
  public set matrix(m: { x: number; y: number }) {
    this._state.matrix = m
  }
  public get matrix(): { x: number; y: number } {
    return this._state.matrix
  }
  public get matrix_x(): number {
    return this._state.matrix.x
  }
  public get matrix_y(): number {
    return this._state.matrix.y
  }
  public get checkpoint(): string {
    return this._state.checkpoint
  }
  add_inventory(i: string) {
    this._state.inventory.push(i)
  }
  return_inventory(): string[] {
    return this._state.inventory
  }
  return_skills(): Skills {
    return this._state.traits.skills
  }
  return_playerroom(): string {
    return this._state.currRoom
  }
  addToAlertLevel(n: number) {
    this.alert_level += n
  }
  private inventory_init() {
    for (const item of this.state.inventory) {
      this.addInvBonus(item)
    }
  }
}
