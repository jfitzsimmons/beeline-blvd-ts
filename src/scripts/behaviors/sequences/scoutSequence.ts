import {
  ActionProps,
  BehaviorKeys,
  HelperProps,
} from '../../../types/behaviors'
import Action from '../action'
import EffectsAction from '../actions/effectsAction'
import ScoutAction from '../actions/scoutAction'
//import InjuryAction from '../actions/injuryAction'

import Sequence from '../sequence'
/**
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
  */
export default class ScoutSequence extends Sequence {
  getProps: (behavior: BehaviorKeys) => ActionProps
  a: HelperProps
  room: string
  constructor(getProps: (behavior: BehaviorKeys) => ActionProps, room: string) {
    /**testjpf
     * do something like
     * constructor(getProps: () => ActionProps)
     */
    const props = getProps('helper') as HelperProps
    const placeActions: Action[] = []

    placeActions.push(new EffectsAction(getProps), new ScoutAction(props, room))
    //  if (isNpc(a)) print('PLACESEQ::: SPR::', a.name, a.sincePlayerRoom)

    //const clanAction:  Action = clanActions(props.clan)

    super(placeActions)
    this.getProps = getProps
    this.a = props
    this.room = room
    print('SCOUTSEQUENCE:: toom to avoid: ', this.room)
  }
  run(): 'REMOVE' | '' {
    for (const child of this.children) {
      child.run()()
      //   if (proceed === 'continue') {
      // this.a.addToBehavior(
      //    'place',
      //    new ScoutSequence(this.getProps, this.room),
      //    true
      //  )
    }
    //}
    return 'REMOVE'
  }
}
