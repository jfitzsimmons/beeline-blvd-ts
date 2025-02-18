import ActorState from '../../states/actor'
import Action from '../action'
import EffectsAction from '../actions/effectsAction'
import PlaceAction from '../actions/placeAction'
import Sequence from '../sequence'

export default class TurnSequence extends Sequence {
  constructor(a: ActorState) {
    const turnActions: Action[] = []
    // or testjpf I could
    // handle doc/ security/ future logic herere?
    //put it here if it has to do with
    //where an NPC should go.
    turnActions.push(...[new EffectsAction(a), new PlaceAction(a)])

    super(turnActions)
  }
  run(): 'REMOVE' | '' {
    for (const child of this.children) {
      child.run()()
    }
    return 'REMOVE'
  }
}
