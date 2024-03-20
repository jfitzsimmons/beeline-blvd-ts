print('testjpf FIRST')

import World from './world'

export class Game {
  public world: World
  constructor() {
    this.world = new World()
    //this.saves
    //this.settings
  }
}
//testjpf could us a game init state??
globalThis.game = new Game()
