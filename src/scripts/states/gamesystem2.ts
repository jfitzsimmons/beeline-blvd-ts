import World from './world'
export class Game {
  public world: World
  constructor() {
    this.world = new World()
  }
}

globalThis.game = new Game()
