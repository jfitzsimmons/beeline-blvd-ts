import ActorState from '../../states/actor'
import { isNpc } from '../../utils/ai'
import Action from '../action'

export default class ImmobileAction extends Action {
  a: ActorState
  constructor(a: ActorState) {
    super(a)
    this.a = a
    this.fail = this.fail.bind(this)
    if (isNpc(this.a))
      print(
        'NEWIMMOBILEACT::: FOR::',
        this.a.name,
        'SPR:::',
        this.a.sincePlayerRoom
      )
  }
  run(): { (): void } {
    if (isNpc(this.a)) {
      print('IMMOBILEACT::: SPR::', this.a.name, this.a.sincePlayerRoom)
      this.a.parent.pruneStationMap(this.a.currRoom, this.a.currStation)
    }
    return () => this.fail()
  }
  fail() {
    print(`ImmobileAction:: ${this.a.name}: DidNotPlace.`)
  }
}
