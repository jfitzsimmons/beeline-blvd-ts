import {
  ActionProps,
  BehaviorKeys,
  MendeeProps,
} from '../../../types/behaviors'
import Action from '../action'
import Sequence from '../sequence'
import InfirmSequence from '../sequences/infirmSequence'

export default class MendeeAction extends Action {
  a: MendeeProps
  getProps: (behavior: BehaviorKeys) => ActionProps
  constructor(getProps: (behavior: BehaviorKeys) => ActionProps) {
    const props = getProps('mendee') as MendeeProps
    super()
    this.a = props
    this.getProps = getProps
  }
  run(): { (): void } {
    if (math.random() > 0.4) this.a.hp = this.a.hp + 1
    print('MendeeAction for::', this.a.name, '| HP:', this.a.hp)
    if (this.a.hp > 4) {
      this.a.updateFromBehavior('hp', 5)
      print('MendeeAction::', this.a.name, 'IS BEING INFIRMED')
      return () => this.delay(new InfirmSequence(this.getProps))
    }
    return () => this.continue('mend')
  }
  continue(s: string): string {
    print(`${this.a.name} is continuing another MendeeSequence`)
    return s
  }
  delay(s: Sequence): void {
    this.a.addToBehavior('place', s)
  }
}
