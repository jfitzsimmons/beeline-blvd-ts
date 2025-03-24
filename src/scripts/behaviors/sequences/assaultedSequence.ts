import {
  ActionProps,
  BehaviorKeys,
  BehaviorRunReturn,
  QuestionProps,
} from '../../../types/behaviors'
import Action from '../action'
import AssaultedAction from '../actions/assaultedAction'
import Sequence from '../sequence'

export default class AssaultedSequence extends Sequence {
  a: QuestionProps
  assaulter: QuestionProps
  getProps: (behavior: BehaviorKeys) => ActionProps
  //  cause: string
  // isHero: boolean
  // prevSpr: number
  constructor(
    getProps: (behavior: BehaviorKeys) => ActionProps,
    assaulter: QuestionProps
    // cause: string
  ) {
    const props = getProps('question') as QuestionProps
    const turnActions: Action[] = []

    turnActions.push(...[new AssaultedAction(getProps, assaulter)])

    super(turnActions)
    this.a = props
    this.assaulter = assaulter
    this.getProps = getProps
    // this.cause = cause
    // this.isHero = this.assaulter.name === 'player' ? true : false
    //   this.prevSpr = this.a.turnPriority

    print(
      '=> Behavior: NEW: AssaultSeq::',
      this.a.name,
      'Suspecting:',
      this.assaulter.name
    )
  }
  run(): BehaviorRunReturn {
    for (const child of this.children) {
      const proceed = child.run()()
      print('000AssaultedSequence:: Proceed is array', Array.isArray(proceed))

      if (Array.isArray(proceed)) {
        print(
          'AssaultedSequence:: Proceed is array',
          Array.isArray(proceed),
          proceed[2].name
        )
        return proceed
      }
    }

    return 'REMOVE'
  }
}
