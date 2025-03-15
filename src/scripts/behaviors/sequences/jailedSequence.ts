import { GetProps, InfirmedProps } from '../../../types/behaviors'
import Action from '../action'
import JailedAction from '../actions/jailedAction'
import Sequence from '../sequence'
import ImmobileSequence from './immobileSequence'
import PlaceSequence from './placeSequence'

export default class JailedSequence extends Sequence {
  a: InfirmedProps
  prevClearance: number
  incidents: number
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
    this.incidents = 0
    this.a.cooldown = 8
  }
  update() {
    print(
      '^^^ => Behavior: JailedSequence:: Update: Sentence extended for: name, cooldown, incidents:',
      this.a.name,
      this.a.cooldown,
      this.incidents
    )
    this.a.cooldown = this.a.cooldown + 10
    this.incidents++
  }
  run(): 'REMOVE' | '' {
    for (const child of this.children) {
      const proceed = child.run()()
      if (proceed === 'continue') {
        this.a.cooldown--

        // this.a.addToBehavior('active', new JailedSequence(this.getProps), true)
        if (
          !this.a.behavior.place.children.some(
            (c) => c instanceof ImmobileSequence
          )
        )
          this.a.addToBehavior('place', new ImmobileSequence(this.getProps))
      } else {
        this.a.updateFromBehavior('clearance', this.prevClearance)
        this.a.updateFromBehavior('turnPriority', math.random(15, 40))
        this.a.updateFromBehavior('cooldown', 0)
        this.a.cooldown = 0
        this.a.addToBehavior('place', new PlaceSequence(this.getProps), false)
      }
      if (this.a.cooldown < 1) {
        print(
          'xxx => Behavior: JailedSequence:: should remove seq for',
          this.a.name
        )
        return 'REMOVE'
      }
    }
    return ''
  }
}
