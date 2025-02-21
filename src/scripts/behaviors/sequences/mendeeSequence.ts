import ActorState from '../../states/actor'
import Action from '../action'
import MendeeAction from '../actions/mendeeAction'
import Sequence from '../sequence'

export default class MendeeSequence extends Sequence {
  constructor(a: ActorState) {
    const turnActions: Action[] = []

    turnActions.push(...[new MendeeAction(a)])

    super(turnActions)
    // print('INJUREDSEQ CREATED!!!')
  }
  run(): 'REMOVE' | '' {
    //   print('INJUREDSEQ RUNRUNRUN!!!')

    for (const child of this.children) {
      child.run()()
    }
    return ''
  }
}
