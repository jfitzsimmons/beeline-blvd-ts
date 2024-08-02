import { PlayerState, Skills } from '../../types/state'
import { QuestMethods } from '../../types/tasks'
import { PlayerInitState } from './inits/playerInitState'
import { shuffle } from '../utils/utils'

function random_skills(skills: Skills, bins: Skills) {
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
  quests: QuestMethods

  constructor() {
    this._state = { ...PlayerInitState }
    random_skills(this._state.skills, this._state.binaries)
    this.quests = {
      return_inventory: this.return_inventory.bind(this),
      return_skills: this.return_skills.bind(this),
      increase_alert_level: this.increase_alert_level.bind(this),
      return_playerroom: this.return_playerroom.bind(this),
    }
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
  public set currentroom(r: string) {
    this._state.currentroom = r
  }
  public get currentroom() {
    return this._state.currentroom
  }

  public set turns(n: number) {
    this._state.turns = n
  }
  public get turns() {
    return this._state.turns
  }
  public set exitroom(r: string) {
    this._state.exitroom = r
  }
  public get exitroom() {
    return this._state.exitroom
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
    return this._state.skills
  }
  return_playerroom(): string {
    return this._state.currentroom
  }
  increase_alert_level() {
    this.alert_level += 1
  }
}
