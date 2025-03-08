import {
  ActionProps,
  BehaviorKeys,
  QuestionProps,
} from '../../../types/behaviors'
import Storage from '../../states/storage'
import Action from '../action'
import ConfrontAction from '../actions/confrontAction'
import Sequence from '../sequence'

export default class SuspicionSequence extends Sequence {
  a: QuestionProps
  perp: QuestionProps
  getProps: (behavior: BehaviorKeys) => ActionProps
  storage?: Storage
  constructor(
    getProps: (behavior: BehaviorKeys) => ActionProps,
    perp: QuestionProps,
    storage?: Storage
  ) {
    const props = getProps('question') as QuestionProps
    const turnActions: Action[] = []
    turnActions.push(...[new ConfrontAction(getProps, perp, storage)])

    super(turnActions)
    this.a = props
    this.perp = perp
    this.getProps = getProps
    this.storage = storage
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
