import ActorState from '../../states/actor'
import { isNpc } from '../../utils/ai'
import Action from '../action'
import InjuredAction from '../actions/injuredAction'
import Sequence from '../sequence'

export default class InjuredSequence extends Sequence {
  a: ActorState

  constructor(a: ActorState) {
    print('CLASSinjuredseq created for:::', a.name)
    const turnActions: Action[] = []

    turnActions.push(...[new InjuredAction(a)])

    super(turnActions)
    this.a = a
    if (isNpc(this.a)) this.a.sincePlayerRoom = 99
  }
  run(): 'REMOVE' | '' {
    for (const child of this.children) {
      const proceed = child.run()()
      print('INJUREDSEQUENCE::: Proceed::', proceed)
      if (proceed === 'continue')
        this.a.behavior.place.children.push(new InjuredSequence(this.a))
    }
    print('INJUREDSEQUENCE::: COMPLETE:: Remove?')

    return 'REMOVE'
  }
}
