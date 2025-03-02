import {
  ActionProps,
  BehaviorKeys,
  InfirmProps,
} from '../../../types/behaviors'
import { RoomsInitState } from '../../states/inits/roomsInitState'
import Action from '../action'
import Sequence from '../sequence'
import JailedSequence from '../sequences/jailedSequence'

export default class ArrestAction extends Action {
  a: InfirmProps
  getProps: (behavior: BehaviorKeys) => ActionProps
  constructor(getProps: (behavior: BehaviorKeys) => ActionProps) {
    const props = getProps('infirm') as InfirmProps
    super(props)
    this.a = props
    this.getProps = getProps
  }
  run(): { (): void } {
    print('ARRESTAction for::', this.a.name, 'sent to jail.')

    const vacancy = this.a.sendToVacancy(
      'security',
      this.a.name,
      this.a.currRoom,
      this.a.currStation
    )
    if (vacancy != null) {
      this.a.currStation = vacancy
      this.a.sincePlayerRoom = 97
      // this.a.parent.addInfirmed(this.name)
      this.a.matrix = RoomsInitState.security.matrix
      this.a.cooldown = 8
      this.a.currRoom = 'security'
      return () => this.delay(new JailedSequence(this.getProps))
    }
    return () => this.fail('ArrestAction:: Need noVacancy logic')

    return () => this.success()
  }
  delay(s: Sequence): void {
    this.a.addToBehavior('active', s)
  }
}
