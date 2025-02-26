import {
  ActionProps,
  BehaviorKeys,
  InfirmProps,
} from '../../../types/behaviors'
import { RoomsInitState } from '../../states/inits/roomsInitState'
import Action from '../action'
import Sequence from '../sequence'
//import Sequence from '../sequence'
import InfirmedSequence from '../sequences/infirmedSequence'

export default class InfirmAction extends Action {
  a: InfirmProps
  getProps: (behavior: BehaviorKeys) => ActionProps
  constructor(getProps: (behavior: BehaviorKeys) => ActionProps) {
    const props = getProps('infirm') as InfirmProps
    super(props)
    this.a = props
    this.getProps = getProps
  }
  run(): { (): void } {
    print('infirmAction for::', this.a.name)

    const vacancy = this.a.sendToVacancy('infirmary', this.a.name)
    if (vacancy != null) {
      this.a.addInfirmed(this.a.name)
      this.a.matrix = RoomsInitState.infirmary.matrix
      this.a.cooldown = 8
      this.a.currRoom = 'infirmary'
      this.a.currStation = vacancy
      return () => this.delay(new InfirmedSequence(this.getProps))
    }
    return () => this.fail('InfirmAction:: Need noVacancy logic')

    return () => this.success()
  }
  delay(s: Sequence): void {
    this.a.addToBehavior('active', s)
  }
}
