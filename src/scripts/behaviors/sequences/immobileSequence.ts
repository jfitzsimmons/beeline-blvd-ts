import { GetProps, ImmobileProps } from '../../../types/behaviors'
//import { isNpc } from '../../utils/ai'
import Action from '../action'
import EffectsAction from '../actions/effectsAction'
import ImmobileAction from '../actions/immobileAction'
import Sequence from '../sequence'

export default class ImmobileSequence extends Sequence {
  a: ImmobileProps
  constructor(getProps: GetProps) {
    const props = getProps('immobile') as ImmobileProps
    const placeActions: Action[] = []

    placeActions.push(
      ...[new EffectsAction(getProps), new ImmobileAction(props)]
    )

    super(placeActions)
    this.a = props
    print(
      '___ => Behavior: NEW:IMMOBILESequence::: name,priority,curroom,station::',
      this.a.name,
      this.a.turnPriority,
      this.a.currRoom,
      this.a.currStation
    )
  }
  run(): 'REMOVE' | '' {
    for (const child of this.children) {
      child.run()()
    }
    return 'REMOVE'
  }
}
