import ActorState from '../../states/actor'
import { isNpc } from '../../utils/ai'
import Action from '../action'
import EffectsAction from '../actions/effectsAction'
import PlaceAction from '../actions/placeAction'
import Sequence from '../sequence'
const lookup: {
  [key: string]: () => typeof Action
} = {
  doctors: doctorActions,
}
function doctorActions() {
  return PlaceAction
}
function clanActions(clan: string): typeof Action {
  return lookup[clan] == undefined ? PlaceAction : lookup[clan]()
}
export default class PlaceSequence extends Sequence {
  constructor(a: ActorState) {
    const placeActions: Action[] = []
    // or testjpf I could
    // handle doc/ security/ future logic herere?
    //put it here if it has to do with
    //where an NPC should go.
    /**
     * maybe add a lookup
     * lookup[doctors] = return *erfull, paramedic or place ...*
     */
    const clanAction: typeof Action = clanActions(isNpc(a) ? a.clan : '')
    placeActions.push(...[new EffectsAction(a), new clanAction(a)])

    super(placeActions)
  }
  run(): 'REMOVE' | '' {
    for (const child of this.children) {
      child.run()()
    }
    return 'REMOVE'
  }
}
