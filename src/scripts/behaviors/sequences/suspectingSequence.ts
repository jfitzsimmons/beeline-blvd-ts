import {
  ActionProps,
  BehaviorKeys,
  QuestionProps,
} from '../../../types/behaviors'
import Storage from '../../states/storage'
import Action from '../action'
import SuspectingAction from '../actions/suspectingAction'
import Sequence from '../sequence'

export default class SuspectingSequence extends Sequence {
  a: QuestionProps
  perp: QuestionProps
  getProps: (behavior: BehaviorKeys) => ActionProps
  cause: string
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

    print(
      'CONFRONTSEQ::: CREATED FOR::',
      this.a.name,
      'CONFRONTING:',
      this.perp.name
    )
  }
  run(): 'REMOVE' | '' {
    for (const child of this.children) {
      child.run()()
    }
    return 'REMOVE'
  }
}
