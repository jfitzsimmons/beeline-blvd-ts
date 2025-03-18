import {
  ActionProps,
  BehaviorKeys,
  InfirmProps,
} from '../../../types/behaviors'
//import { RoomsInitState } from '../../states/inits/roomsInitState'
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

    const vacancy = this.a.sendToVacancy(
      'infirmary',
      this.a.name,
      this.a.currRoom,
      this.a.currStation
    )
    if (vacancy != null) {
      this.a.updateFromBehavior('station', ['infirmary', vacancy])

      return () => this.delay(new InfirmedSequence(this.getProps))
    }
    return () => this.fail('InfirmAction:: Need noVacancy logic')

    return () => this.success()
  }
  delay(s: Sequence): void {
    this.a.addToBehavior('active', s)
  }
}
