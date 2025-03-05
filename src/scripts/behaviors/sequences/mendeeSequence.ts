import {
  ActionProps,
  BehaviorKeys,
  MendeeProps,
} from '../../../types/behaviors'
import Action from '../action'
import MendeeAction from '../actions/mendeeAction'
import Sequence from '../sequence'
import ImmobileSequence from './immobileSequence'

export default class MendeeSequence extends Sequence {
  a: MendeeProps
  getProps: (behavior: BehaviorKeys) => ActionProps

  constructor(getProps: (behavior: BehaviorKeys) => ActionProps) {
    const turnActions: Action[] = []
    const props = getProps('mendee') as MendeeProps
    turnActions.push(...[new MendeeAction(getProps)])

    super(turnActions)
    this.a = props
    this.getProps = getProps
    this.a.updateFromBehavior('turnPriority', 98)
  }
  run(): 'REMOVE' | '' {
    for (const child of this.children) {
      const proceed = child.run()()
      if (proceed === 'mend') {
        this.a.addToBehavior('place', new ImmobileSequence(this.getProps))
        this.a.addToBehavior('active', new MendeeSequence(this.getProps), true)
      }
    }
    return 'REMOVE'
  }
}
