import ActorState from '../../states/actor'
import Action from '../action'

export default class ImmobileAction extends Action {
  a: ActorState
  constructor(a: ActorState) {
    super(a)
    this.a = a
    this.fail = this.fail.bind(this)
  }
  run(): { (): void } {
    return () => this.fail()
  }
  fail() {
    print(`PlaceAction>> ImmobileAction ${this.a.name}: DidNotPlace.`)
  }
}
