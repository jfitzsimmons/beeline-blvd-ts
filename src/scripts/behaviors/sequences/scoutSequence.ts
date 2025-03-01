import {
  ActionProps,
  BehaviorKeys,
  HelperProps,
} from '../../../types/behaviors'
import Action from '../action'
import EffectsAction from '../actions/effectsAction'
import ScoutAction from '../actions/scoutAction'
import Sequence from '../sequence'

export default class ScoutSequence extends Sequence {
  getProps: (behavior: BehaviorKeys) => ActionProps
  a: HelperProps
  room: string
  constructor(getProps: (behavior: BehaviorKeys) => ActionProps, room: string) {
    const props = getProps('helper') as HelperProps
    const placeActions: Action[] = []

    placeActions.push(new EffectsAction(getProps), new ScoutAction(props, room))
    super(placeActions)
    this.getProps = getProps
    this.a = props
    this.room = room
    print('SCOUTSEQUENCE:: toom to avoid: ', this.room)
  }
  run(): 'REMOVE' | '' {
    for (const child of this.children) {
      child.run()()
    }
    return 'REMOVE'
  }
}
