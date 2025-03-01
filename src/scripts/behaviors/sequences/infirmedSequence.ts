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
  getProps: (behavior: BehaviorKeys) => ActionProps

  constructor(getProps: (behavior: BehaviorKeys) => ActionProps) {
    const turnActions: Action[] = []
    const props = getProps('infirmed') as InfirmedProps
    turnActions.push(...[new InfirmedAction(props)])

    super(turnActions)
    this.getProps = getProps
    this.a = props
  }
  run(): 'REMOVE' | '' {
    this.a.sincePlayerRoom = 98

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
        this.a.addToBehavior('place', new PlaceSequence(this.getProps), false)
      }
    }
    return 'REMOVE'
  }
}
