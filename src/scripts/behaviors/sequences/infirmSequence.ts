import {
  ActionProps,
  BehaviorKeys,
  InfirmProps,
} from '../../../types/behaviors'

import Action from '../action'
import EffectsAction from '../actions/effectsAction'
import InfirmAction from '../actions/infirmAction'
import Sequence from '../sequence'

export default class InfirmSequence extends Sequence {
  a: InfirmProps
  constructor(getProps: (behavior: BehaviorKeys) => ActionProps) {
    const placeActions: Action[] = []

    placeActions.push(
      ...[new EffectsAction(getProps), new InfirmAction(getProps)]
    )

    super(placeActions)
    this.a = getProps('infirm') as InfirmProps
    this.a.updateFromBehavior('turnPriority', 97)
  }
  run(): 'REMOVE' | '' {
    //this.a.turnPriority = 97

    for (const child of this.children) {
      child.run()()
    }
    return 'REMOVE'
  }
}
