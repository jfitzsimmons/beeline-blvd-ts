import {
  ActionProps,
  BehaviorKeys,
  InfirmProps,
} from '../../../types/behaviors'
import Action from '../action'
import ArrestAction from '../actions/arrestAction'
import EffectsAction from '../actions/effectsAction'
import Sequence from '../sequence'

export default class ArrestSequence extends Sequence {
  a: InfirmProps
  constructor(getProps: (behavior: BehaviorKeys) => ActionProps) {
    const placeActions: Action[] = []

    placeActions.push(
      ...[new EffectsAction(getProps), new ArrestAction(getProps)]
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
