import ActorState from '../../states/actor'
import { isNpc } from '../../utils/ai'
import Action from '../action'
import InjuredAction from '../actions/injuredAction'
import Sequence from '../sequence'

export default class InfirmedSequence extends Sequence {
  a: ActorState
  constructor(a: ActorState) {
    const turnActions: Action[] = []

    turnActions.push(...[new InjuredAction(a)])

    super(turnActions)
    this.a = a
  }
  run(): 'REMOVE' | '' {
    if (isNpc(this.a)) this.a.sincePlayerRoom = 98

    for (const child of this.children) {
      child.run()()
    }
    return 'REMOVE'
  }
}
