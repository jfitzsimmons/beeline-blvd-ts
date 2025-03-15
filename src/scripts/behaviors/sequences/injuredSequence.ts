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
    const props = getProps('injured') as InjuredProps
    const turnActions: Action[] = []

    turnActions.push(...[new InjuredAction(getProps)])

    super(turnActions)
    //testjpf updating a doesnt update npc? getter setter?
    this.a = props
    this.getProps = getProps
    this.a.updateFromBehavior('turnPriority', 98)
    print('NEWINJUREDSEQ FOR', this.a.name)
  }
  run(): 'REMOVE' | '' {
    this.a.updateFromBehavior('turnPriority', 98)

    for (const child of this.children) {
      const proceed = child.run()()
      print('INJUREDSEQUENCE::: Proceed::', this.a.name, ':', proceed)
      if (proceed === 'continue') {
        this.a.addToBehavior('active', new InjuredSequence(this.getProps))

        if (
          !this.a.behavior.place.children.some(
            (c) => c instanceof ImmobileSequence
          )
        )
          this.a.addToBehavior('place', new ImmobileSequence(this.getProps))
      } else if (proceed == 'mend') {
        this.a.addToBehavior('active', new MendeeSequence(this.getProps))

        if (
          !this.a.behavior.place.children.some(
            (c) => c instanceof ImmobileSequence
          )
        )
          this.a.addToBehavior('place', new ImmobileSequence(this.getProps))
      }
    }
    return 'REMOVE'
  }
}
