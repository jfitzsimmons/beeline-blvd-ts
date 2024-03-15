import World from './world'
print('testjpf FIRST')

export class Game {
  public world: World
  constructor() {
    this.world = new World()
  }
}

globalThis.game = new Game()
