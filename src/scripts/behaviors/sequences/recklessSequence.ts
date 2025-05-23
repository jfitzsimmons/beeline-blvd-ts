import {
  ActionProps,
  BehaviorKeys,
  AnnouncerProps,
} from '../../../types/behaviors'
import Action from '../action'
import RecklessAction from '../actions/recklessAction'
import Sequence from '../sequence'

export default class RecklessSequence extends Sequence {
  a: AnnouncerProps
  inspirer: AnnouncerProps
  getProps: (behavior: BehaviorKeys) => ActionProps
  purpose: string
  constructor(
    getProps: (behavior: BehaviorKeys) => ActionProps,
    inspirer: AnnouncerProps,
    purpose: string
  ) {
    const props = getProps('announcer') as AnnouncerProps
    const turnActions: Action[] = []

    turnActions.push(...[new RecklessAction(getProps, inspirer, purpose)])

    super(turnActions)
    this.a = props
    this.inspirer = inspirer
    this.inspirer.cooldown = 3
    this.purpose = purpose
    this.getProps = getProps
    if (this.a.turnPriority < 94) this.a.updateFromBehavior('turnPriority', 94)

    print(
      '=> Behavior: NEW: RecklessSeq::',
      this.a.name,
      'inpired by:',
      this.inspirer.name,
      this.purpose
    )
  }
  run(): 'REMOVE' | '' {
    for (const child of this.children) {
      const proceed = child.run()()
      print(
        '$$$ => Behavior: RecklessSEQUENCE::: Proceed::',
        this.a.name,
        ':',
        proceed
      )
      this.inspirer.cooldown--
    }
    if (this.inspirer.cooldown < 1) {
      if (this.a.turnPriority < 95)
        this.a.updateFromBehavior('turnPriority', math.random(15, 35))
      print(
        'XXX => Behavior: RecklessSequence:: Remove remove seq for',
        this.a.name
      )
      return 'REMOVE'
    }
    return ''
  }
}
