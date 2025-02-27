import {
  ActionProps,
  BehaviorKeys,
  InjuredProps,
} from '../../../types/behaviors'
import Action from '../action'
import InjuredAction from '../actions/injuredAction'
import Sequence from '../sequence'
import ImmobileSequence from './immobileSequence'
import MendeeSequence from './mendeeSequence'

export default class InjuredSequence extends Sequence {
  a: InjuredProps
  getProps: (behavior: BehaviorKeys) => ActionProps
  constructor(getProps: (behavior: BehaviorKeys) => ActionProps) {
    /**testjpf
     * do something like
     * constructor(getProps: () => ActionProps)
     */
    const props = getProps('injured') as InjuredProps
    // print('CLASSinjuredseq created for:::', a.name)
    const turnActions: Action[] = []

    turnActions.push(...[new InjuredAction(getProps)])

    super(turnActions)
    this.a = props
    this.getProps = getProps
  }
  run(): 'REMOVE' | '' {
    this.a.sincePlayerRoom = 99
    //for (let i = 0; i < this.children.length; i++) {
    for (const child of this.children) {
      const proceed = child.run()()
      print('INJUREDSEQUENCE::: Proceed::', this.a.name, ':', proceed)
      //const props = this.getProps('immobile') as ImmobileProps

      if (proceed === 'continue') {
        this.a.addToBehavior('active', new InjuredSequence(this.getProps))
        this.a.addToBehavior('place', new ImmobileSequence(this.getProps))
      } else if (proceed == 'mend') {
        this.a.addToBehavior('active', new MendeeSequence(this.getProps))
        this.a.addToBehavior('place', new ImmobileSequence(this.getProps))
      }
    }
    // print('INJUREDSEQUENCE::: COMPLETE:: Remove?')

    return 'REMOVE'
  }
}
