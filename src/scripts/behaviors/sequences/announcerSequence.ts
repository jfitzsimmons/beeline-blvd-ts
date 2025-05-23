import {
  ActionProps,
  BehaviorKeys,
  AnnouncerProps,
} from '../../../types/behaviors'
import Action from '../action'
import AnnouncerAction from '../actions/announcerAction'
import Sequence from '../sequence'

export default class AnnouncerSequence extends Sequence {
  a: AnnouncerProps
  announcee: AnnouncerProps
  getProps: (behavior: BehaviorKeys) => ActionProps
  purpose: string
  constructor(
    getProps: (behavior: BehaviorKeys) => ActionProps,
    announcee: AnnouncerProps,
    purpose: string
  ) {
    const props = getProps('announcer') as AnnouncerProps
    const turnActions: Action[] = []

    turnActions.push(...[new AnnouncerAction(getProps, announcee, purpose)])

    super(turnActions)

    this.a = props
    this.announcee = announcee
    this.announcee.cooldown = 3
    this.purpose = purpose
    this.getProps = getProps
    if (this.a.turnPriority < 94) this.a.updateFromBehavior('turnPriority', 94)
  }
  run(): 'REMOVE' | '' {
    for (const child of this.children) {
      const proceed = child.run()()
      print(
        '$$$ => Behavior: announcerSEQUENCE::: Proceed::',
        this.a.name,
        ':',
        proceed
      )
      proceed === 'continue'
        ? this.announcee.cooldown--
        : (this.announcee.cooldown = 0)
      if (this.announcee.cooldown < 1) {
        if (this.a.turnPriority < 95)
          this.a.updateFromBehavior('turnPriority', math.random(15, 35))
        print(
          'xxx=> Behavior: AnouncerSequence:: should remove seq for',
          this.a.name
        )
        return 'REMOVE'
      }
    }
    return ''
  }
}
