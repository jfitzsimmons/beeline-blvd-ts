import { GetProps, QuestionProps } from '../../../types/behaviors'
import { crimeSeverity } from '../../utils/ai'
import Action from '../action'
import QuestionAction from '../actions/questionAction'
import Sequence from '../sequence'
import ArrestSequence from './arrestSequence'

export default class QuestionSequence extends Sequence {
  a: QuestionProps
  perp: GetProps
  getProps: GetProps
  reason: string
  incidents = 0
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
    if (this.a.turnPriority < 95) this.a.updateFromBehavior('turnPriority', 95)
    this.a.cooldown = 10
  }
  update(reason: string) {
    print(
      '^^^ => Behavior: QuestionSequence:: Update: Crime Spree for: name, incidents:',
      this.a.name,
      this.incidents,
      this.a.cooldown
    )
    if (crimeSeverity[reason] > crimeSeverity[this.reason]) this.reason = reason
    this.incidents++
    this.a.cooldown = this.a.cooldown + 12
  }
  run(): 'REMOVE' | '' {
    if (this.a.turnPriority < 95) this.a.updateFromBehavior('turnPriority', 95)

    for (const child of this.children) {
      const proceed = child.run()()
      print(
        '$$$ => Behavior: QuestionSEQUENCE::: Proceed::',
        this.a.name,
        ':',
        proceed
      )
      if (proceed === 'continue') {
        this.a.cooldown--
      } else if (proceed == 'jailed') {
        const perp = this.perp('question') as QuestionProps
        perp.addToBehavior('place', new ArrestSequence(this.perp))
        this.a.cooldown = 0
      } else {
        this.a.cooldown = 0
      }
    }
    if (this.a.cooldown < 1) {
      print(
        'xxx => Behavior: QuestionSequence:: should remove seq for',
        this.a.name
      )
      return 'REMOVE'
    }
    return ''
  }
}
