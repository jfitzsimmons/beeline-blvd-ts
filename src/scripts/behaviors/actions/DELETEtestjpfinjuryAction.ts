import {
  ActionProps,
  BehaviorKeys,
  DefaultBehaviorProps,
} from '../../../types/behaviors'

import Action from '../action'
//testjpf DELTEE ME ?!?!?!?
export default class InjuryAction extends Action {
  a: DefaultBehaviorProps
  constructor(getProps: (behavior: BehaviorKeys) => ActionProps) {
    const props = getProps('injury') as DefaultBehaviorProps
    super()
    this.a = props
  }
  run(): { (): void } {
    return () => this.continue('injury')
  }
  continue(s: string): string {
    print('InjuryAction:: Default: return Continue:', this.a.name)
    return s
  }
}
