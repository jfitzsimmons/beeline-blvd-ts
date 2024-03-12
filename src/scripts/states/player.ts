import { PlayerState, Skills, QuestMethods } from '../../types/state'
import { PlayerInitState } from './inits/playerInitState'

function shuffle(arrN: number[]): number[]
function shuffle(arrS: string[]): string[]
function shuffle(array: Array<string | number>): Array<string | number> {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[array[i], array[j]] = [array[j], array[i]]
  }
  return array
}

function random_skills(skills: Skills) {
  const tempvals: number[] = shuffle([1, 1, 3, 4, 5, 6, 6, 7])
  let count = 0
  let ks: keyof typeof skills // Type is "one" | "two" | "three"
  for (ks in skills) {
    skills[ks] = tempvals[count] + math.random(-1, 1)
    count++
  }
}

export default class WorldPlayer {
  private _state: PlayerState
  quests: QuestMethods

  constructor() {
    this._state = { ...PlayerInitState }
    random_skills(this._state.skills)
    this.quests = {
      return_inventory: this.return_inventory.bind(this),
      return_skills: this.return_skills.bind(this),
      increase_alert_level: this.increase_alert_level.bind(this),
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
  public set hp(n: number) {
    this._state.hp = n
  }
  public get hp() {
    return this._state.hp
  }
  public set ap(n: number) {
    this._state.ap = n
  }
  public get ap() {
    return this._state.ap
  }
  public set currentroom(r: string) {
    this._state.currentroom = r
  }

  public set turns(n: number) {
    this._state.turns = n
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
  return_inventory() {
    return this._state.inventory
  }
  return_skills() {
    return this._state.skills
  }
  increase_alert_level() {
    this._state.alert_level += 1
  }
}
