import ActorState from '../../states/actor'
import { isNpc } from '../../utils/ai'
import Action from '../action'
import InjuredAction from '../actions/injuredAction'
import Sequence from '../sequence'
import MendeeSequence from './mendeeSequence'

export default class InjuredSequence extends Sequence {
  a: ActorState

  constructor(a: ActorState) {
    // print('CLASSinjuredseq created for:::', a.name)
    const turnActions: Action[] = []

    turnActions.push(...[new InjuredAction(a)])

    super(turnActions)
    this.a = a
  }
  run(): 'REMOVE' | '' {
    if (isNpc(this.a)) this.a.sincePlayerRoom = 99
    //for (let i = 0; i < this.children.length; i++) {
    for (const child of this.children) {
      const proceed = child.run()()
      print('INJUREDSEQUENCE::: Proceed::', this.a.name, ':', proceed)
      print(
        '111::: INJSEQ:: place.childrenlenght:',
        this.a.behavior.place.children.length
      )
      if (proceed === 'continue') {
        this.a.behavior.active.children.push(new InjuredSequence(this.a))
      } else if (proceed == 'mend') {
        this.a.behavior.active.children.push(new MendeeSequence(this.a))
      }
      print(
        '222::: INJSEQ:: place.childrenlenght:',
        this.a.behavior.place.children.length
      )
    }
    // print('INJUREDSEQUENCE::: COMPLETE:: Remove?')

    return 'REMOVE'
  }
}
