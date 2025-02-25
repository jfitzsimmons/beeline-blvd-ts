import ActorState from '../../states/actor'
import { isNpc } from '../../utils/ai'
import Action from '../action'
import EffectsAction from '../actions/effectsAction'
//import InjuryAction from '../actions/injuryAction'
import MedicPlaceAction from '../actions/MedicPlaceAction'
import PlaceAction from '../actions/placeAction'
import Sequence from '../sequence'
const lookup: {
  [key: string]: () => typeof Action
} = {
  doctors: doctorActions,
}
function doctorActions() {
  print('DODOCTORACTIONSWORK???')
  return MedicPlaceAction
}
function clanActions(clan: string): typeof Action {
  return lookup[clan] == undefined ? PlaceAction : lookup[clan]()
}
export default class PlaceSequence extends Sequence {
  a: ActorState
  constructor(a: ActorState) {
    const placeActions: Action[] = []
    // or testjpf I could
    // handle doc/ security/ future logic herere?
    //put it here if it has to do with
    //where an NPC should go.
    placeActions.push(new EffectsAction(a))
    if (isNpc(a)) print('PLACESEQ::: SPR::', a.name, a.sincePlayerRoom)
    //testjpf 97 is infirmSeq
    // testjpf could do:::
    // return () =>

    const clanAction: typeof Action = clanActions(isNpc(a) ? a.clan : '')

    placeActions.push(new clanAction(a))

    /**
     * maybe add a lookup
     * lookup[doctors] = return *erfull, paramedic or place ...*
     */
    // placeActions.push(...[new EffectsAction(a), new clanAction(a)])

    super(placeActions)
    this.a = a
  }
  run(): 'REMOVE' | '' {
    for (const child of this.children) {
      const proceed = child.run()()
      if (proceed === 'injury') {
        print(
          'PlaceSequence::: InjuryAction:: Add new InjuredSequence:',
          this.a.name
        )
        //        this.a.behavior.active.children.push(new InjuredSequence(this.a))
      }
    }
    return 'REMOVE'
  }
}
