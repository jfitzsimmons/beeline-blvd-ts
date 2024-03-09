import { PlayerState, Skills } from '../../types/state'
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

// need rooms interface?
export default class WorldPlayer {
  private player: PlayerState
  constructor() {
    this.player = { ...PlayerInitState }
    random_skills(this.player.skills)
  }

  private return_inventory() {
    return this.player.inventory
  }
  private return_skills() {
    return this.player.skills
  }
}
