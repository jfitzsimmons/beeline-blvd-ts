import { ActionProps, BehaviorKeys, PlaceProps } from '../../../types/behaviors'
import Action from '../action'
import EffectsAction from '../actions/effectsAction'
//import InjuryAction from '../actions/injuryAction'
import MedicPlaceAction from '../actions/medicPlaceAction'
import PlaceAction from '../actions/placeAction'
import Sequence from '../sequence'
const lookup: {
  [key: string]: (getProps: (behavior: BehaviorKeys) => ActionProps) => Action
} = {
  doctors: doctorActions,
}
function doctorActions(getProps: (behavior: BehaviorKeys) => ActionProps) {
  print('DODOCTORACTIONSWORK???')
  const props = getProps('medplace')
  return new MedicPlaceAction(props)
}
function clanActions(
  clan: string,
  getProps: (behavior: BehaviorKeys) => ActionProps
): Action {
  if (lookup[clan] == undefined) {
    const props = getProps('place')
    return new PlaceAction(props)
  } else {
    return lookup[clan](getProps)
  }
}
export default class PlaceSequence extends Sequence {
  // getProps: (behavior: BehaviorKeys) => ActionProps
  constructor(getProps: (behavior: BehaviorKeys) => ActionProps) {
    /**testjpf
     * do something like
     * constructor(getProps: () => ActionProps)
     */
    const props = getProps('place') as PlaceProps
    const placeActions: Action[] = []

    placeActions.push(new EffectsAction(getProps))
    //  if (isNpc(a)) print('PLACESEQ::: SPR::', a.name, a.sincePlayerRoom)

    //const clanAction:  Action = clanActions(props.clan)

    placeActions.push(clanActions(props.clan, getProps))

    super(placeActions)
    // this.getProps = getProps
  }
  run(): 'REMOVE' | '' {
    for (const child of this.children) {
      //const proceed = child.run()()
      child.run()()
    }
    return 'REMOVE'
  }
}
