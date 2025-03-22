import {
  ActionProps,
  BehaviorKeys,
  GetProps,
  HeroBehaviorKeys,
  PlaceProps,
} from '../../../types/behaviors'
import Action from '../action'
import CopPlaceAction from '../actions/copPlaceAction'
import EffectsAction from '../actions/effectsAction'
import HeroPlaceAction from '../actions/heroPlaceAction'
import MedicPlaceAction from '../actions/medicPlaceAction'
import PlaceAction from '../actions/placeAction'
import Sequence from '../sequence'
const lookup: {
  [key: string]: (getProps: GetProps) => Action
} = {
  doctors: doctorActions,
  hero: playerActions,
  security: securityActions,
}
function securityActions(getProps: GetProps) {
  const gp = getProps as (behavior: BehaviorKeys) => ActionProps
  const props = gp('cops')
  return new CopPlaceAction(props)
}
function doctorActions(getProps: GetProps) {
  const gp = getProps as (behavior: BehaviorKeys) => ActionProps
  const props = gp('medplace')
  return new MedicPlaceAction(props)
}
function playerActions(getProps: (behavior: HeroBehaviorKeys) => ActionProps) {
  const props = getProps
  return new HeroPlaceAction(props)
}
function clanActions(clan: string, getProps: GetProps): Action {
  if (lookup[clan] == undefined) {
    return new PlaceAction(getProps)
  } else {
    return lookup[clan](getProps)
  }
}
export default class PlaceSequence extends Sequence {
  constructor(getProps: GetProps) {
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
