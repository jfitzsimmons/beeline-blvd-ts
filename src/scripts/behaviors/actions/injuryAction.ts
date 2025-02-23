import ActorState from '../../states/actor'
import { isNpc } from '../../utils/ai'
import Action from '../action'

export default class InjuryAction extends Action {
  a: ActorState
  constructor(a: ActorState) {
    super(a)
    this.a = a
  }
  run(): { (): void } {
    const { actor: a } = this
    //testjpf oninjurystart
    if (isNpc(a)) {
      a.sincePlayerRoom = 99
      a.parent.addInjured(a.name)
      a.parent.pruneStationMap(a.currRoom, a.currStation)
    }
    a.hp = 0

    //testjpf returns to PlaceSequence
    return () => this.continue('injury')
  }
  continue(s: string): string {
    print('InjuryAction:: Default: return Continue:', this.a.name)
    return s
  }
}
