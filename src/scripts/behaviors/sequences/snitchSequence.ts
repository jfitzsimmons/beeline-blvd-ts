import {
  ActionProps,
  BehaviorKeys,
  HelperProps,
} from '../../../types/behaviors'
import Action from '../action'
import SnitchAction from '../actions/snitchAction'
//import HelperAction from '../actions/helperAction'
import Sequence from '../sequence'
import ScoutSequence from './scoutSequence'

export default class SnitchSequence extends Sequence {
  a: HelperProps
  perp: HelperProps
  getProps: (behavior: BehaviorKeys) => ActionProps
  crimeScene: string
  constructor(
    getProps: (behavior: BehaviorKeys) => ActionProps,
    perp: HelperProps
  ) {
    const props = getProps('helper') as HelperProps
    const turnActions: Action[] = []

    turnActions.push(...[new SnitchAction(getProps, perp)])

    super(turnActions)
    this.a = props
    this.getProps = getProps
    this.perp = perp
    this.crimeScene = perp.currRoom
    print(
      'SnitchSEQUENCE::: Created For::',
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
      print('SnitchSEQUENCE::: Proceed::', this.a.name, ':', proceed)
      if (proceed === 'continue') {
        this.a.addToBehavior(
          'active',
          new SnitchSequence(this.getProps, this.perp)
        )
        this.a.addToBehavior(
          'place',
          new ScoutSequence(this.getProps, this.crimeScene)
        )
      }
    }
    // print('INJUREDSEQUENCE::: COMPLETE:: Remove?')

    return 'REMOVE'
  }
}
