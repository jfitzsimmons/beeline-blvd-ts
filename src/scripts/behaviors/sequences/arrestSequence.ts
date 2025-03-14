import { GetProps, InfirmProps } from '../../../types/behaviors'
import Action from '../action'
import ArrestAction from '../actions/arrestAction'
import EffectsAction from '../actions/effectsAction'
import Sequence from '../sequence'

export default class ArrestSequence extends Sequence {
  a: InfirmProps
  pauseTurns: number
  constructor(getProps: GetProps, pauseTurns = 0) {
    const placeActions: Action[] = []

    placeActions.push(
      ...[new EffectsAction(getProps), new ArrestAction(getProps)]
    )

    super(placeActions)
    this.a = getProps('infirm') as InfirmProps
    this.a.updateFromBehavior('turnPriority', 97)
    this.pauseTurns = pauseTurns
  }
  run(): 'REMOVE' | '' {
    if (this.pauseTurns > 0) return ''
    for (const child of this.children) {
      child.run()()
    }
    return 'REMOVE'
  }
}
