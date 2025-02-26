import ActorState from '../../states/actor'
import { RoomsInitState } from '../../states/inits/roomsInitState'
import { isNpc } from '../../utils/ai'
import Action from '../action'
import Sequence from '../sequence'
//import Sequence from '../sequence'
import InfirmedSequence from '../sequences/infirmedSequence'

export default class InfirmAction extends Action {
  a: ActorState
  constructor(a: ActorState) {
    super(a)
    this.a = a
  }
  run(): { (): void } {
    print('infirmAction for::', this.a.name)
    if (isNpc(this.a)) {
      const vacancy = this.a.parent.sendToVacancy('infirmary', this.a.name)
      if (vacancy != null) {
        this.a.parent.clearStation(
          this.a.currRoom,
          this.a.currStation,
          this.a.name
        )
        this.a.parent.addInfirmed(this.a.name)
        this.a.matrix = RoomsInitState.infirmary.matrix
        this.a.cooldown = 8
        this.a.currRoom = 'infirmary'
        this.a.currStation = vacancy
        return () => this.delay(new InfirmedSequence(this.a))
      }
      return () => this.fail('InfirmAction:: Need noVacancy logic')
    }

    return () => this.success()
  }
  delay(s: Sequence): void {
    this.a.behavior.active.children.push(s)
  }
}
