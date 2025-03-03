import {
  ActionProps,
  BehaviorKeys,
  InjuredProps,
} from '../../../types/behaviors'
import Action from '../action'
import TrespassAction from '../actions/trespassAction'
import Sequence from '../sequence'
//import PlaceSequence from './placeSequence'
//import ImmobileSequence from './immobileSequence'
//import InjuredSequence from './injuredSequence'
//import MendeeSequence from './mendeeSequence'

export default class TrespassSequence extends Sequence {
  a: InjuredProps
  prevSpr: number
  getProps: (behavior: BehaviorKeys) => ActionProps
  constructor(getProps: (behavior: BehaviorKeys) => ActionProps) {
    const props = getProps('injured') as InjuredProps
    const turnActions: Action[] = []

    turnActions.push(...[new TrespassAction(getProps)])

    super(turnActions)
    this.a = props
    this.getProps = getProps
    this.prevSpr = this.a.sincePlayerRoom
    print('TrespassSeq:: new for', this.a.name, 'in', this.a.currRoom)
    //this.a.updateFromBehavior('sincePlayerRoom', 96)
  }
  run(): 'REMOVE' | '' {
    for (const child of this.children) {
      const proceed = child.run()()
      if (proceed == 'continue')
        this.a.updateFromBehavior('sincePlayerRoom', this.prevSpr)
    }

    return 'REMOVE'
  }
}
