import {
  GetProps,
  HeroInjuredProps,
  InjuredProps,
} from '../../../types/behaviors'
import Action from '../action'
import TrespassAction from '../actions/trespassAction'
import Sequence from '../sequence'

export default class TrespassSequence extends Sequence {
  a: InjuredProps | HeroInjuredProps
  prevSpr: number
  getProps: GetProps
  constructor(getProps: GetProps) {
    const props = getProps('injured')
    const turnActions: Action[] = []

    turnActions.push(...[new TrespassAction(getProps)])

    super(turnActions)
    this.a =
      props.name === 'player'
        ? (props as HeroInjuredProps)
        : (props as InjuredProps)
    this.getProps = getProps
    this.prevSpr = this.a.turnPriority
    print('___ TrespassSeq:: new for', this.a.name, 'in', this.a.currRoom)

    this.a.updateFromBehavior('turnPriority', 93)
  }
  run(): 'REMOVE' | '' {
    for (const child of this.children) {
      const proceed = child.run()()
      if (proceed == 'continue')
        this.a.updateFromBehavior('turnPriority', this.prevSpr)
    }

    return 'REMOVE'
  }
}
