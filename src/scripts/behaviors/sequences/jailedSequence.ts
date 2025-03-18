import { GetProps, InfirmedProps } from '../../../types/behaviors'
import Action from '../action'
import JailedAction from '../actions/jailedAction'
import Sequence from '../sequence'
import ImmobileSequence from './immobileSequence'
import PlaceSequence from './placeSequence'

export default class JailedSequence extends Sequence {
  a: InfirmedProps
  prevClearance: number
  getProps: GetProps

  constructor(getProps: GetProps) {
    const turnActions: Action[] = []
    const props = getProps('infirmed') as InfirmedProps
    turnActions.push(...[new JailedAction(props)])

    super(turnActions)
    this.getProps = getProps
    this.a = props
    this.prevClearance = this.a.clearance
    this.a.updateFromBehavior('clearance', 4)
    this.a.updateFromBehavior('turnPriority', 98)
  }
  update() {
    print(
      '^^^ => Behavior: JailedSequence:: Update: Sentence extended for::',
      this.a.name
    )
    for (const child of this.children) {
      child.update()
    }
  }
  run(): 'REMOVE' | '' {
    for (const child of this.children) {
      const proceed = child.run()()
      if (proceed === 'continue') {
        // this.a.addToBehavior('active', new JailedSequence(this.getProps), true)
        if (
          !this.a.behavior.place.children.some(
            (c) => c instanceof ImmobileSequence
          )
        )
          this.a.addToBehavior('place', new ImmobileSequence(this.getProps))
      } else {
        print(
          'xxx => Behavior: JailedSequence:: should remove seq for',
          this.a.name
        )
        this.a.updateFromBehavior('clearance', this.prevClearance)
        this.a.updateFromBehavior('turnPriority', math.random(15, 40))
        this.a.updateFromBehavior('cooldown', 0)
        this.a.addToBehavior('place', new PlaceSequence(this.getProps), false)
        return 'REMOVE'
      }
    }
    return ''
  }
}
