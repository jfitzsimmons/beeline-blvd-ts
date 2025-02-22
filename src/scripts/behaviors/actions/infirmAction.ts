import ActorState from '../../states/actor'
import { RoomsInitState } from '../../states/inits/roomsInitState'
import { isNpc } from '../../utils/ai'
import Action from '../action'

export default class InfirmAction extends Action {
  a: ActorState
  constructor(a: ActorState) {
    super(a)
    this.a = a
  }
  run(): { (): void } {
    print('infirmAction for::', this.a)
    if (isNpc(this.a)) {
      this.a.parent.clearStation(
        this.a.currRoom,
        this.a.currStation,
        this.a.name
      )
      this.a.sincePlayerRoom = 99
      this.a.parent.addInfirmed(this.a.name)
      this.a.matrix = RoomsInitState.infirmary.matrix
      this.a.cooldown = 8
      this.a.currRoom = 'infirmary'
    }

    /**
     * TESTJPF TODO!!!
     * I think I want to got to next place action
     * have logic in immobileSeq? that
     * checks if infirmed?
     */
    //if (testjpfimmobile) return () => this.alternate(ImmobileAction(this))
    // if (testjpf) return () => this.fail('youfailed')
    return () => this.success()
  }
}
