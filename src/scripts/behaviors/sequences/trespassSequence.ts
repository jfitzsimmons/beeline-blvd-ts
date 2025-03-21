import {
  GetProps,
  HeroInjuredProps,
  InjuredProps,
} from '../../../types/behaviors'
import Action from '../action'
import TrespassAction from '../actions/trespassAction'
import Sequence from '../sequence'
import OnScreenSequence from './onScreenSequence'

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

    if (this.a.turnPriority < 93) this.a.updateFromBehavior('turnPriority', 93)
  }
  run(): 'REMOVE' | '' {
    for (const child of this.children) {
      const proceed = child.run()()
      if (proceed == 'continue')
        this.a.updateFromBehavior('turnPriority', this.prevSpr)

      if (
        this.a.name !== 'player' &&
        this.a.currRoom == (this.a as InjuredProps).getFocusedRoom()
      )
        this.a.addToBehavior(
          'active',
          new OnScreenSequence('trespass', this.getProps),
          true
        )
      //if onscreen return ''
      //testjpf or...
      // add an OnScreen Behavior????!!!
      // really i just need this for dialog interaction!!
      //I think with these current props it should work
    }

    return 'REMOVE'
  }
}
