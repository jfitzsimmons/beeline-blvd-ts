import {
  ActionProps,
  BehaviorKeys,
  InfirmedProps,
} from '../../../types/behaviors'
import Action from '../action'
import JailedAction from '../actions/jailedAction'
import Sequence from '../sequence'
import ImmobileSequence from './immobileSequence'
import PlaceSequence from './placeSequence'

export default class JailedSequence extends Sequence {
  a: InfirmedProps
  getProps: (behavior: BehaviorKeys) => ActionProps

  constructor(getProps: (behavior: BehaviorKeys) => ActionProps) {
    const turnActions: Action[] = []
    const props = getProps('infirmed') as InfirmedProps
    turnActions.push(...[new JailedAction(props)])

    super(turnActions)
    this.getProps = getProps
    this.a = props
  }
  run(): 'REMOVE' | '' {
    this.a.sincePlayerRoom = 97

    for (const child of this.children) {
      const proceed = child.run()()
      if (proceed === 'continue') {
        this.a.addToBehavior('active', new JailedSequence(this.getProps), true)
        this.a.addToBehavior('place', new ImmobileSequence(this.getProps))
      } else {
        this.a.addToBehavior('place', new PlaceSequence(this.getProps), false)
      }
    }
    return 'REMOVE'
  }
}
