import ActorState from '../../states/actor'
import { isNpc } from '../../utils/ai'
import { doctors } from '../../utils/consts'
import Action from '../action'

export default class InfirmedAction extends Action {
  a: ActorState
  constructor(a: ActorState) {
    super(a)
    this.a = a
  }
  run(): { (): void } {
    print('infirmEDAction for::', this.a)
    if (isNpc(this.a)) {
      this.a.sincePlayerRoom = 99
      this.a.parent.isStationedTogether(doctors, 'infirmary') === true
        ? (this.a.hp = this.a.hp + 2)
        : (this.a.hp = this.a.hp + 1)

      if (this.a.hp > 9) print('INFIRMEDaction:: Need new behavior logic HERE') //this.a.fsm.setState('turn')
    }
    /**
     * TESTJPF TODO!!!
     */
    //if (testjpfimmobile) return () => this.alternate(ImmobileAction(this))
    // if (testjpf) return () => this.fail('youfailed')
    return () => this.success()
  }
}
