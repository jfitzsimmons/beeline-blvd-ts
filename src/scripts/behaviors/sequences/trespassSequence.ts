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
  getProps: (behavior: BehaviorKeys) => ActionProps
  constructor(getProps: (behavior: BehaviorKeys) => ActionProps) {
    const props = getProps('injured') as InjuredProps
    const turnActions: Action[] = []

    turnActions.push(...[new TrespassAction(getProps)])

    super(turnActions)
    this.a = props
    this.getProps = getProps
  }
  run(): 'REMOVE' | '' {
    // this.a.sincePlayerRoom = 99
    for (const child of this.children) {
      child.run()()
      print('TRESPASSSEQUENCE::: Proceed::', this.a.name)
    }
    return 'REMOVE'
  }
}
