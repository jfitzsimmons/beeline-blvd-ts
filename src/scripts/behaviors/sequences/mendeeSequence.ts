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
    // print('INJUREDSEQ CREATED!!!')
    this.a = props
    this.getProps = getProps
  }
  run(): 'REMOVE' | '' {
    this.a.sincePlayerRoom = 98

    //   print('INJUREDSEQ RUNRUNRUN!!!')
    print('MendeeSequence:: Running for:', this.a.name)
    // for (let i = 0; i < this.children.length; i++) {
    for (const child of this.children) {
      const proceed = child.run()()
      if (proceed === 'mend') {
        // const props = this.getProps('immobile') as ImmobileProps
        this.a.addToBehavior('place', new ImmobileSequence(this.getProps))
        this.a.addToBehavior('active', new MendeeSequence(this.getProps), true)
      }
      //i++
    }
    return 'REMOVE'
  }
}
