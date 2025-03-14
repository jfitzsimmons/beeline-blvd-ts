import {
  ActionProps,
  BehaviorKeys,
  InfirmedProps,
} from '../../../types/behaviors'
import Action from '../action'
import InfirmedAction from '../actions/infirmedAction'
import Sequence from '../sequence'
import ImmobileSequence from './immobileSequence'
import PlaceSequence from './placeSequence'

export default class InfirmedSequence extends Sequence {
  a: InfirmedProps
  prevClearance: number
  getProps: (behavior: BehaviorKeys) => ActionProps

  constructor(getProps: (behavior: BehaviorKeys) => ActionProps) {
    const turnActions: Action[] = []
    const props = getProps('infirmed') as InfirmedProps
    turnActions.push(...[new InfirmedAction(props)])

    super(turnActions)
    this.getProps = getProps
    this.a = props
    this.prevClearance = this.a.clearance
    this.a.updateFromBehavior('turnPriority', 98)
    this.a.updateFromBehavior('clearance', 4)
  }
  run(): 'REMOVE' | '' {
    for (const child of this.children) {
      const proceed = child.run()()
      if (proceed === 'continue') {
        this.a.addToBehavior(
          'active',
          new InfirmedSequence(this.getProps),
          true
        )
        this.a.addToBehavior('place', new ImmobileSequence(this.getProps))
      } else {
        this.a.updateFromBehavior('clearance', this.prevClearance)
        this.a.updateFromBehavior('turnPriority', math.random(15, 40))
        this.a.updateFromBehavior('hp', 10)
        this.a.addToBehavior('place', new PlaceSequence(this.getProps), false)
      }
    }
    return 'REMOVE'
  }
}
