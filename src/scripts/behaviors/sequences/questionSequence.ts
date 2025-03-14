import { GetProps, QuestionProps } from '../../../types/behaviors'
import Action from '../action'
import QuestionAction from '../actions/questionAction'
import Sequence from '../sequence'
import ArrestSequence from './arrestSequence'

export default class QuestionSequence extends Sequence {
  a: QuestionProps
  perp: GetProps
  getProps: GetProps
  reason: string
  constructor(getProps: GetProps, perp: GetProps, reason: string) {
    const props = getProps('question') as QuestionProps
    const turnActions: Action[] = []
    /**
     * testjpf
     * creates a new Sequence APB
     * if a security officer meets another secofficer with and apb
     * all security gets and arrest sequence
     *
     * similar to has task, should we have has Sequence?!!!
     * so remove hastask and mendee logic from Task.
     * Move to NPCS!!!
     *
     * need to make sure the timeout after so many TURNS
     */
    turnActions.push(
      ...[
        new QuestionAction(getProps, perp('question') as QuestionProps, reason),
      ]
    )
    super(turnActions)
    this.a = props
    this.perp = perp
    this.getProps = getProps
    this.reason = reason
    this.a.updateFromBehavior('turnPriority', 95)
  }
  run(): 'REMOVE' | '' {
    this.a.updateFromBehavior('turnPriority', 95)

    for (const child of this.children) {
      const proceed = child.run()()
      print('QuestionSEQUENCE::: Proceed::', this.a.name, ':', proceed)
      if (proceed === 'continue') {
        this.a.addToBehavior(
          'active',
          new QuestionSequence(this.getProps, this.perp, this.reason),
          true
        )
      } else if (proceed == 'jailed') {
        const perp = this.perp('question') as QuestionProps
        perp.addToBehavior('place', new ArrestSequence(this.perp))
      }
    }
    return 'REMOVE'
  }
}
