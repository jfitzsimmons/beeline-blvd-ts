import {
  ActionProps,
  BehaviorKeys,
  HelperProps,
} from '../../../types/behaviors'
import { security } from '../../utils/consts'
import Action from '../action'
import QuestionSequence from '../sequences/questionSequence'
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
    if (this.a.currRoom == 'security') return () => this.continue('busy')
    if (this.a.currRoom == this.a.getFocusedRoom()) {
      msg.post(`/${this.a.currStation}#npc_loader`, hash('move_npc'), {
        station: 'phone',
        npc: this.a.name,
      })
      // prettier-ignore
      print(this.a.name, 'STATION MOVE VIA  PHONeACTION in', this.a.currRoom)
    }

    const callConnected = Object.values(this.a.getOccupants('security')).filter(
      (o) => security.includes(o)
    )

    if (callConnected.length > 0 && math.random() > 0.5) {
      for (const c of callConnected) {
        const cop = this.a.returnNpc(c)
        if (cop.turnPriority < 96) {
          //const perp = this.getProps('question') as QuestionProps
          cop.addToBehavior(
            'active',
            new QuestionSequence(
              cop.getBehaviorProps.bind(cop),
              this.getProps,
              this.reason
            )
          )
          return () =>
            this.success(
              `${this.a.name} Call connected PHONeACTION in ${this.a.currRoom}`
            )
        }
      }
    } else {
      return () =>
        this.continue(
          `${this.a.name} PHONeACTION still waiting for security to pick up ${this.a.currRoom}`
        )
    }
    return () =>
      this.continue(
        `${this.a.name} PHONeACTION no suitable Security to pick up ${this.a.currRoom}`
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
