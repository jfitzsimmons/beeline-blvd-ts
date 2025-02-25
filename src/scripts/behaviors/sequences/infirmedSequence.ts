import ActorState from '../../states/actor'
import { isNpc } from '../../utils/ai'
import Action from '../action'
import InfirmedAction from '../actions/infirmedAction'
import Sequence from '../sequence'
import ImmobileSequence from './immobileSequence'
import PlaceSequence from './placeSequence'

export default class InfirmedSequence extends Sequence {
  a: ActorState
  constructor(a: ActorState) {
    const turnActions: Action[] = []

    turnActions.push(...[new InfirmedAction(a)])

    super(turnActions)
    this.a = a
  }
  run(): 'REMOVE' | '' {
    if (isNpc(this.a)) this.a.sincePlayerRoom = 98

    for (const child of this.children) {
      const proceed = child.run()()
      if (proceed === 'continue') {
        this.a.behavior.active.children.unshift(new InfirmedSequence(this.a))
        this.a.behavior.place.children.push(new ImmobileSequence(this.a))
      } else {
        this.a.behavior.place.children.push(new PlaceSequence(this.a))
      }
    }
    return 'REMOVE'
  }
}
