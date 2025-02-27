import {
  ActionProps,
  BehaviorKeys,
  InjuredProps,
  MenderProps,
} from '../../../types/behaviors'
//import ActorState from '../../states/actor'
import Action from '../action'
import MenderAction from '../actions/menderAction'
import Sequence from '../sequence'
import ImmobileSequence from './immobileSequence'
import PlaceSequence from './placeSequence'

export default class MenderSequence extends Sequence {
  a: MenderProps
  mendee: InjuredProps
  getProps: (behavior: BehaviorKeys) => () => ActionProps
  constructor(
    getProps: (behavior: BehaviorKeys) => () => ActionProps,
    mendee: InjuredProps
  ) {
    const props = getProps('mender')() as MenderProps

    const turnActions: Action[] = []

    turnActions.push(...[new MenderAction(props, mendee)]) //ne to add MoveNpcAction?

    super(turnActions)
    this.a = props
    this.mendee = mendee
    this.getProps = getProps
    print(
      this.a.name,
      'MENDERSEQ CREATED!!!:: DOC,a::',
      mendee,
      this.a.sincePlayerRoom,
      this.a.currRoom,
      this.a.currStation
    )
  }
  run(): 'REMOVE' | '' {
    this.a.sincePlayerRoom = 98
    print('Mend-ER-Sequence:: Running for:', this.a.name)
    for (const child of this.children) {
      const proceed = child.run()()
      if (proceed === 'continue') {
        this.a.addToBehavior(
          'active',
          new MenderSequence(this.getProps, this.mendee)
        )
        this.a.addToBehavior('place', new ImmobileSequence(this.getProps))
      } else {
        this.a.addToBehavior('place', new PlaceSequence(this.getProps))
      }
    }
    return 'REMOVE'
  }
}
