import ActorState from '../../states/actor'
import { isNpc } from '../../utils/ai'
import Action from '../action'

export default class ImmobileAction extends Action {
  a: ActorState
  constructor(a: ActorState) {
    super(a)
    this.a = a
    this.fail = this.fail.bind(this)
  }
  run(): { (): void } {
    if (isNpc(this.a))
      this.a.parent.pruneStationMap(this.a.currRoom, this.a.currStation)

    return () => this.fail()
  }
  fail() {
    print(`PlaceAction>> ImmobileAction ${this.a.name}: DidNotPlace.`)
  }
}
