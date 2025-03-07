import {
  ActionProps,
  BehaviorKeys,
  QuestionProps,
} from '../../../types/behaviors'
import Storage from '../../states/storage'
import Action from '../action'
import ConfrontAction from '../actions/confrontAction'
import Sequence from '../sequence'

export default class ConfrontSequence extends Sequence {
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
     */
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
