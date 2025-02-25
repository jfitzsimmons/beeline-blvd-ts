import ActorState from '../../states/actor'
import { isNpc } from '../../utils/ai'
import Action from '../action'
import EffectsAction from '../actions/effectsAction'
import InjuryAction from '../actions/injuryAction'
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
    if (a.hp < 1) {
      print(a.name, 'CHOSE injuryACTION')
      //testjpf
      //need injury sequence
      //should be given to testnpc on new
      /**
       * when should npcs be checked for hp == 0???!!!
       * in the FSM???
       * KEEP!?!!?: I think we'll need this as a catch all
       * for non component code TEMP TEMP TEMP
       * TODO
       * basically I dont have the ability to trigger
       *  ingame Injury Actions!!! ATM.
       */
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
        //        this.a.behavior.active.children.push(new InjuredSequence(this.a))
      }
    }
    return 'REMOVE'
  }
}
