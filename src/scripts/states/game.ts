import StateMachine from './stateMachine'
import World from './world'

export class Game {
  world: World
  fsm: StateMachine

  constructor() {
    this.fsm = new StateMachine(this, 'game')
    this.world = new World()
    //this.saves
    //this.settings
    this.fsm.addState('idle').addState('new', {
      onEnter: this.onNewEnter.bind(this),
      // onUpdate: this.onNewUpdate.bind(this),
      // onExit: this.onNewExit.bind(this),
    })
  }
  private onNewEnter(): void {
    this.world.fsm.setState('new')
  }
  // private onNewUpdate(): void {}
  // private onNewExit(): void {}
}
//globalThis.game = new Game()
