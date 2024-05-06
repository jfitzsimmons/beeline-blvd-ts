import World from './world'

export class Game {
  public world: World
  constructor() {
    this.world = new World()
    //this.saves
    //this.settings
  }
}
globalThis.game = new Game()
