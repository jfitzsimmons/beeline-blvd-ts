import {
  ActionProps,
  BehaviorKeys,
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
    // if (this.prevSpr < 94) this.a.updateFromBehavior('turnPriority', 94)
  }
  run(): 'REMOVE' | '' {
    for (const child of this.children) {
      child.run()()
      // if (proceed == 'continue')
      // this.a.updateFromBehavior('turnPriority', this.prevSpr)
    }

    return 'REMOVE'
  }
}
