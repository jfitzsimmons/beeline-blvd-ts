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
  }
  run(): 'REMOVE' | '' {
    this.a.sincePlayerRoom = 97

    for (const child of this.children) {
      child.run()()
    }
    return 'REMOVE'
  }
}
