import ActorState from '../../states/actor'
import Action from '../action'
import EffectsAction from '../actions/effectsAction'
import PlaceAction from '../actions/placeAction'
import Sequence from '../sequence'

export default class PlaceSequence extends Sequence {
  constructor(a: ActorState) {
    const placeActions: Action[] = []
    // or testjpf I could
    // handle doc/ security/ future logic herere?
    //put it here if it has to do with
    //where an NPC should go.
    placeActions.push(...[new EffectsAction(a), new PlaceAction(a)])

    super(placeActions)
  }
  run(): 'REMOVE' | '' {
    for (const child of this.children) {
      child.run()()
    }
    return 'REMOVE'
  }
}
