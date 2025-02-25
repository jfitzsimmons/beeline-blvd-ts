import ActorState from '../../states/actor'
import { isNpc } from '../../utils/ai'
import Action from '../action'
import MendeeAction from '../actions/mendeeAction'
import Sequence from '../sequence'
import ImmobileSequence from './immobileSequence'

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
    if (isNpc(this.a)) this.a.sincePlayerRoom = 98

    //   print('INJUREDSEQ RUNRUNRUN!!!')
    print('MendeeSequence:: Running for:', this.a.name)
    // for (let i = 0; i < this.children.length; i++) {
    for (const child of this.children) {
      const proceed = child.run()()
      if (proceed === 'mend') {
        this.a.behavior.place.children.push(new ImmobileSequence(this.a))
        this.a.behavior.active.children.unshift(new MendeeSequence(this.a))
      }
      //i++
    }
    return 'REMOVE'
  }
}
