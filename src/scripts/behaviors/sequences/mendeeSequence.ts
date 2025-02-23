import ActorState from '../../states/actor'
import Action from '../action'
import MendeeAction from '../actions/mendeeAction'
import Sequence from '../sequence'

export default class MendeeSequence extends Sequence {
  a: ActorState
  constructor(a: ActorState) {
    const turnActions: Action[] = []

    turnActions.push(...[new MendeeAction(a)])

    super(turnActions)
    // print('INJUREDSEQ CREATED!!!')
    this.a = a
  }
  run(): 'REMOVE' | '' {
    //   print('INJUREDSEQ RUNRUNRUN!!!')
    print('MendeeSequence:: Running for:', this.a.name)
    for (const child of this.children) {
      const proceed = child.run()()
      if (proceed === 'continue')
        this.a.behavior.place.children.push(new MendeeSequence(this.a))
    }
    return ''
  }
}
