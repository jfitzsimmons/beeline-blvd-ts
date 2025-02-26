import ActorState from '../../states/actor'
import { isNpc } from '../../utils/ai'
import Action from '../action'
import EffectsAction from '../actions/effectsAction'
//import InjuryAction from '../actions/injuryAction'
import MedicPlaceAction from '../actions/medicPlaceAction'
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

    placeActions.push(new EffectsAction(a))
    if (isNpc(a)) print('PLACESEQ::: SPR::', a.name, a.sincePlayerRoom)

    const clanAction: typeof Action = clanActions(isNpc(a) ? a.clan : '')

    placeActions.push(new clanAction(a))

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
