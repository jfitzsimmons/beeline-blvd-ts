import { ActionProps, BehaviorKeys, PlaceProps } from '../../../types/behaviors'
import Action from '../action'
import EffectsAction from '../actions/effectsAction'
import MedicPlaceAction from '../actions/medicPlaceAction'
import PlaceAction from '../actions/placeAction'
import Sequence from '../sequence'
const lookup: {
  [key: string]: (getProps: (behavior: BehaviorKeys) => ActionProps) => Action
} = {
  doctors: doctorActions,
}
function doctorActions(getProps: (behavior: BehaviorKeys) => ActionProps) {
  const props = getProps('medplace')
  return new MedicPlaceAction(props)
}
function clanActions(
  clan: string,
  getProps: (behavior: BehaviorKeys) => ActionProps
): Action {
  if (lookup[clan] == undefined) {
    return new PlaceAction(getProps)
  } else {
    return lookup[clan](getProps)
  }
}
export default class PlaceSequence extends Sequence {
  constructor(getProps: (behavior: BehaviorKeys) => ActionProps) {
    const props = getProps('place') as PlaceProps
    const placeActions: Action[] = []

    placeActions.push(new EffectsAction(getProps))
    placeActions.push(clanActions(props.clan, getProps))

    super(placeActions)
  }
  run(): 'REMOVE' | '' {
    for (const child of this.children) {
      child.run()()
    }
    return 'REMOVE'
  }
}
