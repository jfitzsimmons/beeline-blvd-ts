import {
  // ActionProps,
  //  AnnouncerProps,
  //  BehaviorKeys,
  GetProps,
  QuestionProps,
} from '../../../types/behaviors'
import Action from '../action'
import QuestionAction from '../actions/questionAction'
import Sequence from '../sequence'
import ArrestSequence from './arrestSequence'
//import RecklessSequence from './recklessSequence'

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
     * for clearance/trespass this fires immediately
     * look to see if target is in room
     * do they then have a securityplaceaction
     * What determines how severe to target this person?
     * do like mendee? docplace
     * npc.wantedLevel?????
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
  }
  run(): 'REMOVE' | '' {
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
      } /**
      else if (proceed == 'reckless') {
        const perp = this.perp('announcer') as AnnouncerProps
        print(
          'SupectingAction::',
          this.a.name,
          'will become reckless about::',
          perp.name
        )
        perp.addToBehavior(
          'active',
          new RecklessSequence(
            this.getProps as (behavior: BehaviorKeys) => ActionProps,
            perp.getBehaviorProps('announcer') as AnnouncerProps,
            this.reason
          )
        )
      }**/
    }
    return 'REMOVE'
  }
}
