import { GetProps, InfirmProps } from '../../../types/behaviors'
import Action from '../action'
import ArrestAction from '../actions/arrestAction'
import EffectsAction from '../actions/effectsAction'
import Sequence from '../sequence'

export default class ArrestSequence extends Sequence {
  a: InfirmProps
  constructor(getProps: GetProps) {
    const placeActions: Action[] = []

    placeActions.push(
      ...[new EffectsAction(getProps), new ArrestAction(getProps)]
    )

    super(placeActions)
    this.a = getProps('infirm') as InfirmProps
    this.a.updateFromBehavior('turnPriority', 96)
  }
  run(): 'REMOVE' | '' {
    for (const child of this.children) {
      child.run()()
    }
    return 'REMOVE'
  }
}
