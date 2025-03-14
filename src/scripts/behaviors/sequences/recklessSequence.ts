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
    //testjpf updating a doesnt update npc? getter setter?
    this.a = props
    this.inspirer = inspirer
    this.inspirer.cooldown = 3
    this.purpose = purpose
    this.getProps = getProps
    this.a.updateFromBehavior('turnPriority', 94)
  }
  run(): 'REMOVE' | '' {
    for (const child of this.children) {
      const proceed = child.run()()
      print('RecklessSEQUENCE::: Proceed::', this.a.name, ':', proceed)
      if (proceed === 'continue') this.inspirer.cooldown--
      if (this.inspirer.cooldown < 1) {
        this.a.updateFromBehavior('turnPriority', math.random(15, 35))
        print('RecklessSequence:: should remove seq for', this.a.name)
        return 'REMOVE'
      }
    }
    return ''
  }
}
