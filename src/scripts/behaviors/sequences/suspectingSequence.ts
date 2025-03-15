import {
  ActionProps,
  AnnouncerProps,
  BehaviorKeys,
  QuestionProps,
} from '../../../types/behaviors'
import Storage from '../../states/storage'
import Action from '../action'
import SuspectingAction from '../actions/suspectingAction'
import Sequence from '../sequence'
import RecklessSequence from './recklessSequence'

// TESTJPF
//TODO NEED SuspectingPlayerAction
export default class SuspectingSequence extends Sequence {
  a: QuestionProps
  perp: QuestionProps
  getProps: (behavior: BehaviorKeys) => ActionProps
  cause: string
  isHero: boolean
  prevSpr: number
  storage?: Storage
  constructor(
    getProps: (behavior: BehaviorKeys) => ActionProps,
    perp: QuestionProps,
    cause: string,
    storage?: Storage
  ) {
    const props = getProps('question') as QuestionProps
    const turnActions: Action[] = []
    turnActions.push(...[new SuspectingAction(getProps, perp, cause, storage)])

    super(turnActions)
    this.a = props
    this.perp = perp
    this.getProps = getProps
    this.storage = storage
    this.cause = cause
    this.isHero = this.perp.name === 'player' ? true : false
    this.prevSpr = this.a.turnPriority

    print(
      '=> Behavior: NEW: SuspectingSeq::',
      this.a.name,
      'Suspecting:',
      this.perp.name
    )
    this.a.updateFromBehavior('turnPriority', 94)
  }
  run(): 'REMOVE' | '' {
    for (const child of this.children) {
      const proceed = child.run()()
      if (proceed === 'reckless') {
        print(
          '>>> => Behavior: Run: SupectingAction::',
          this.a.name,
          'will become reckless about::',
          this.perp.name
        )
        this.perp.addToBehavior(
          'active',
          new RecklessSequence(
            this.a.getBehaviorProps.bind(this.a),
            this.perp.getBehaviorProps('announcer') as AnnouncerProps,
            this.cause
          )
        )
      }
    }
    this.a.updateFromBehavior('turnPriority', this.prevSpr)
    return 'REMOVE'
  }
}
