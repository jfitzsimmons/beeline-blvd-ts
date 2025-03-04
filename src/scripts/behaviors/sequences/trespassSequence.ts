import { GetProps, InjuredProps } from '../../../types/behaviors'
import Action from '../action'
import TrespassAction from '../actions/trespassAction'
import Sequence from '../sequence'

export default class TrespassSequence extends Sequence {
  a: InjuredProps
  prevSpr: number
  getProps: GetProps
  constructor(getProps: GetProps) {
    const props = getProps('injured') as InjuredProps
    const turnActions: Action[] = []

    turnActions.push(...[new TrespassAction(getProps)])

    super(turnActions)
    this.a = props
    this.getProps = getProps
    this.prevSpr = this.a.turnPriority
    print('TrespassSeq:: new for', this.a.name, 'in', this.a.currRoom)
    //this.a.updateFromBehavior('turnPriority', 96)
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
