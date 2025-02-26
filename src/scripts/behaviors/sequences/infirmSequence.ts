import ActorState from '../../states/actor'
import { isNpc } from '../../utils/ai'
import Action from '../action'
import EffectsAction from '../actions/effectsAction'
import InfirmAction from '../actions/infirmAction'
import Sequence from '../sequence'

export default class InfirmSequence extends Sequence {
  a: ActorState
  constructor(a: ActorState) {
    const placeActions: Action[] = []

    placeActions.push(...[new EffectsAction(a), new InfirmAction(a)])

    super(placeActions)
    this.a = a
  }
  run(): 'REMOVE' | '' {
    if (isNpc(this.a)) this.a.sincePlayerRoom = 97

    for (const child of this.children) {
      child.run()()
    }
    return 'REMOVE'
  }
}
