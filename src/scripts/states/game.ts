import StateMachine from './stateMachine'
import World from './world'

export class Game {
  world!: World
  fsm: StateMachine

  constructor() {
    //profiler.enable_ui(true)
    print('... ___ CREATING GAME STATE ___ ...')
    this.fsm = new StateMachine(this, 'game')
    this.fsm.addState('idle').addState('new', {
      onEnter: this.onNewEnter.bind(this),
    })
    this.createNewWorld = this.createNewWorld.bind(this)
    print('... ___ FINISHED CREATING GAME STATE ___ ...')
  }
  private onNewEnter(): void {
    this.world = this.createNewWorld()
    this.world.fsm.setState('new')
    print('... ___ NEW GAME LOADED ||| AI Taking Turn... ... ...')

    this.world.fsm.setState('turn')
  }
  createNewWorld(): World {
    return new World()
  }
}
