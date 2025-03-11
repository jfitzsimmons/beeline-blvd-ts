import {
  ActionProps,
  BehaviorKeys,
  HelperProps,
} from '../../../types/behaviors'
import { security } from '../../utils/consts'
import Action from '../action'
//testjpf need busy check to
// see if someone is at the phone
export default class PhoneAction extends Action {
  a: HelperProps
  perp: HelperProps
  reason: string

  getProps: (behavior: BehaviorKeys) => ActionProps
  constructor(
    getProps: (behavior: BehaviorKeys) => ActionProps,
    perp: HelperProps,
    reason: string
  ) {
    const props = getProps('helper') as HelperProps
    super(props)
    this.a = props
    this.getProps = getProps
    this.perp = perp
    this.reason = reason
    this.a.updateFromBehavior('turnPriority', 96)
  }
  run(): { (): void } {
    if (this.a.currRoom == this.a.getFocusedRoom()) {
      msg.post(`/${this.a.currStation}#npc_loader`, hash('move_npc'), {
        station: 'phone',
        npc: this.a.name,
      })
      // prettier-ignore
      print(this.a.name, 'STATION MOVE VIA  PHONeACTION in', this.a.currRoom)
    }

    const callConnected = Object.values(this.a.getOccupants('security')).some(
      (o) => security.includes(o)
    )

    return callConnected === true && math.random() > 0.5
      ? () =>
          this.success(
            `${this.a.name} Call connected PHONeACTION in ${this.a.currRoom}`
          )
      : () =>
          this.continue(
            `${this.a.name} PHONeACTION still waiting for security to pick up ${this.a.currRoom}`
          )
  }
  continue(s: string): string {
    print('PhoneAction:: Continue:', s)
    return 'phone'
  }
  success(s?: string) {
    print('PhoneAction:: Continue:', s)
  }
}
