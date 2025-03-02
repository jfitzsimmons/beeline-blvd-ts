import {
  ActionProps,
  BehaviorKeys,
  DefaultBehaviorProps,
} from '../../../types/behaviors'

import Action from '../action'

export default class InjuryAction extends Action {
  a: DefaultBehaviorProps
  constructor(getProps: (behavior: BehaviorKeys) => ActionProps) {
    const props = getProps('injury') as DefaultBehaviorProps
    super(props)
    this.a = props
  }
  run(): { (): void } {
    //const { actor: a } = this
    this.a.sincePlayerRoom = 99
    //this.a.addInjured(this.a.name)
    // a.parent.pruneStationMap(a.currRoom, a.currStation)

    this.a.hp = 0

    //testjpf returns to PlaceSequence
    return () => this.continue('injury')
  }
  continue(s: string): string {
    print('InjuryAction:: Default: return Continue:', this.a.name)
    return s
  }
}
