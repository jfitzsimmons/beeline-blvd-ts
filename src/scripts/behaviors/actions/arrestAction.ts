import { GetProps, InfirmProps } from '../../../types/behaviors'
//import { RoomsInitState } from '../../states/inits/roomsInitState'
import Action from '../action'
import Sequence from '../sequence'
import JailedSequence from '../sequences/jailedSequence'

export default class ArrestAction extends Action {
  a: InfirmProps
  getProps: GetProps
  constructor(getProps: GetProps) {
    const props = getProps('infirm') as InfirmProps
    super()
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
      this.a.updateFromBehavior('station', ['security', vacancy])
      this.a.updateFromBehavior('cooldown', 10)
      return () => this.delay(new JailedSequence(this.getProps))
    }
    return () => this.fail('ArrestAction:: Need noVacancy logic')

    //return () => this.success()
  }
  delay(s: Sequence): void {
    this.a.addToBehavior('active', s)
  }
}
