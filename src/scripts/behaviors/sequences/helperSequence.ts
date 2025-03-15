import {
  ActionProps,
  BehaviorKeys,
  HelperProps,
} from '../../../types/behaviors'
import Action from '../action'
import HelperAction from '../actions/helperAction'
import Sequence from '../sequence'
import ScoutSequence from './scoutSequence'

export default class HelperSequence extends Sequence {
  a: HelperProps
  victim = ''
  getProps: (behavior: BehaviorKeys) => ActionProps
  constructor(
    getProps: (behavior: BehaviorKeys) => ActionProps,
    victim: string
  ) {
    const props = getProps('helper') as HelperProps
    const turnActions: Action[] = []

    turnActions.push(...[new HelperAction(getProps, victim)])

    super(turnActions)
    this.a = props
    this.getProps = getProps
    this.victim = victim
    print(
      '___ => Behavior: helperSEQUENCE::: NEWNEWNEW::',
      this.a.name,
      ':',
      this.victim
    )
    this.a.updateFromBehavior('turnPriority', 94)
  }
  run(): 'REMOVE' | '' {
    this.a.updateFromBehavior('turnPriority', 94)

    for (const child of this.children) {
      const proceed = child.run()()
      print(
        '$$$ => Behavior: helperSEQUENCE::: Proceed::',
        this.a.name,
        ':',
        proceed
      )
      if (proceed === 'continue') {
        this.a.addToBehavior(
          'active',
          new HelperSequence(this.getProps, this.victim),
          true
        )
        if (this.a.behavior.place.children.length < 1)
          this.a.addToBehavior(
            'place',
            new ScoutSequence(
              this.getProps,
              this.a.returnNpc(this.victim).currRoom
            )
          )
      }
    }
    // print('INJUREDSEQUENCE::: COMPLETE:: Remove?')

    return 'REMOVE'
  }
}
