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
  state: PlayerState
  quests: QuestMethods

  constructor() {
    this.state = { ...PlayerInitState }
    random_skills(this.state.skills)
    this.quests = {
      return_inventory: this.return_inventory.bind(this),
      return_skills: this.return_skills.bind(this),
      increase_alert_level: this.increase_alert_level.bind(this),
    }
  }

  return_inventory() {
    return this.state.inventory
  }
  return_skills() {
    return this.state.skills
  }
  increase_alert_level() {
    this.state.alert_level += 1
  }
}
