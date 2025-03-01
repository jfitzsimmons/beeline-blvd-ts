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
  }
  run(): 'REMOVE' | '' {
    print(
      '2222INJSEQ: RETURNEDNPC',
      this.a.returnNpc(this.a.name).sincePlayerRoom,
      'THIS.A',
      this.a.sincePlayerRoom
    )

    this.a.returnNpc(this.a.name).sincePlayerRoom = 99
    print(
      '2222INJSEQ: RETURNEDNPC',
      this.a.returnNpc(this.a.name).sincePlayerRoom,
      'THIS.A',
      this.a.sincePlayerRoom
    )
    for (const child of this.children) {
      const proceed = child.run()()
      print('INJUREDSEQUENCE::: Proceed::', this.a.name, ':', proceed)
      if (proceed === 'continue') {
        this.a.addToBehavior('active', new InjuredSequence(this.getProps))
        this.a.addToBehavior('place', new ImmobileSequence(this.getProps))
      } else if (proceed == 'mend') {
        this.a.addToBehavior('active', new MendeeSequence(this.getProps))
        this.a.addToBehavior('place', new ImmobileSequence(this.getProps))
      }
    }
    return 'REMOVE'
  }
}
