import ActorState from '../../states/actor'
import Action from '../action'
import InjuredAction from '../actions/injuredAction'
import Sequence from '../sequence'

export default class InjuredSequence extends Sequence {
  constructor(a: ActorState) {
    const turnActions: Action[] = []

    turnActions.push(...[new InjuredAction(a)])

    super(turnActions)
    print('INJUREDSEQ CREATED!!!')
  }
  run(): 'REMOVE' | '' {
    print('INJUREDSEQ RUNRUNRUN!!!')

    for (const child of this.children) {
      child.run()()
    }
    return ''
  }
}
