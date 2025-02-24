import ActorState from '../../states/actor'
import { isNpc } from '../../utils/ai'
import Action from '../action'
import EffectsAction from '../actions/effectsAction'
import ImmobileAction from '../actions/immobileAction'
import InjuryAction from '../actions/injuryAction'
import MedicPlaceAction from '../actions/MedicPlaceAction'
import PlaceAction from '../actions/placeAction'
import Sequence from '../sequence'
import InjuredSequence from './injuredSequence'
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
    if (isNpc(a) && a.sincePlayerRoom > 97) {
      //testjpf 97 is infirmSeq
      // testjpf could do:::
      // return () =>
      // this.fail(`PlaceAction::: ${a.name}: DidNotPlace. Is immobile.`)
      print(a.name, 'CHOSE IMMOBILEACTION', a.sincePlayerRoom)
      placeActions.push(new ImmobileAction(a))
    } else if (a.hp < 1) {
      print(a.name, 'CHOSE injuryACTION')

      placeActions.push(new InjuryAction(a))
    } else {
      const clanAction: typeof Action = clanActions(isNpc(a) ? a.clan : '')

      placeActions.push(new clanAction(a))
    }
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
        this.a.behavior.active.children.push(new InjuredSequence(this.a))
      }
    }
    return 'REMOVE'
  }
}
