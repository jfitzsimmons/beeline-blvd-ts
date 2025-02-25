import ActorState from '../../states/actor'
//import { isNpc } from '../../utils/ai'
import Action from '../action'
import EffectsAction from '../actions/effectsAction'
import ImmobileAction from '../actions/immobileAction'
import Sequence from '../sequence'

export default class ImmobileSequence extends Sequence {
  a: ActorState
  constructor(a: ActorState) {
    const placeActions: Action[] = []

    placeActions.push(...[new EffectsAction(a), new ImmobileAction(a)])

    super(placeActions)
    this.a = a
  }
  run(): 'REMOVE' | '' {
    for (const child of this.children) {
      child.run()()
    }
    return 'REMOVE'
  }
}
