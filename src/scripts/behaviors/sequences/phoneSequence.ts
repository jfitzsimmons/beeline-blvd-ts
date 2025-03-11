import {
  ActionProps,
  BehaviorKeys,
  HelperProps,
} from '../../../types/behaviors'
import Action from '../action'
import PhoneAction from '../actions/phoneAction'
import SnitchAction from '../actions/snitchAction'
//import HelperAction from '../actions/helperAction'
import Sequence from '../sequence'
import ImmobileSequence from './immobileSequence'
import SnitchSequence from './snitchSequence'

export default class PhoneSequence extends Sequence {
  a: HelperProps
  perp: HelperProps
  reason: string
  getProps: (behavior: BehaviorKeys) => ActionProps
  crimeScene: string
  constructor(
    getProps: (behavior: BehaviorKeys) => ActionProps,
    perp: HelperProps,
    reason: string
  ) {
    const props = getProps('helper') as HelperProps
    const turnActions: Action[] = []

    turnActions.push(
      ...[
        new SnitchAction(getProps, perp, reason),
        new PhoneAction(getProps, perp, reason),
      ]
    )

    super(turnActions)
    this.a = props
    this.getProps = getProps
    this.perp = perp
    this.reason = reason
    this.crimeScene = perp.currRoom
    print(
      'PhoneSEQUENCE::: Created For::',
      this.a.name,
      'against:',
      this.perp.name,
      'in',
      this.crimeScene
    )
  }
  run(): 'REMOVE' | '' {
    for (const child of this.children) {
      const proceed = child.run()()
      print('PhoneSEQUENCE::: Proceed::', this.a.name, ':', proceed)
      if (proceed === 'phone') {
        this.a.addToBehavior(
          'active',
          new PhoneSequence(this.getProps, this.perp, this.reason)
        )
        this.a.addToBehavior('place', new ImmobileSequence(this.getProps))
      } else if (proceed === 'busy') {
        this.a.updateFromBehavior('turnPriority', math.random(10, 30))
        this.a.addToBehavior(
          'active',
          new SnitchSequence(this.getProps, this.perp, this.reason)
        )
      }
    }
    return 'REMOVE'
  }
}
