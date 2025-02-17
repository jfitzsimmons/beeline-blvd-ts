import ActorState from '../../states/actor'
import Action from '../action'
import EffectsAction from '../actions/effectsAction'
import PlaceAction from '../actions/placeAction'
import Sequence from '../sequence'

export default class TurnSequence extends Sequence {
  constructor(a: ActorState) {
    const turnActions: Action[] = []

    turnActions.push(...[new EffectsAction(a), new PlaceAction(a)])

    super(turnActions)
  }
  run() {
    for (const child of this.children) {
      child.run()
    }
  }
}
