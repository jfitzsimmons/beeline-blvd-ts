import {
  ActionProps,
  BehaviorKeys,
  HelperProps,
} from '../../../types/behaviors'
import { crimeSeverity } from '../../utils/ai'
import Action from '../action'
import SnitchAction from '../actions/snitchAction'
//import HelperAction from '../actions/helperAction'
import Sequence from '../sequence'
import ScoutSequence from './scoutSequence'

export default class SnitchSequence extends Sequence {
  a: HelperProps
  perp: HelperProps
  reason: string
  incidents = 0
  getProps: (behavior: BehaviorKeys) => ActionProps
  crimeScene: string
  constructor(
    getProps: (behavior: BehaviorKeys) => ActionProps,
    perp: HelperProps,
    reason: string
  ) {
    const props = getProps('helper') as HelperProps
    const turnActions: Action[] = []

    turnActions.push(...[new SnitchAction(getProps, perp, reason)])

    super(turnActions)
    this.a = props
    this.getProps = getProps
    this.perp = perp
    this.reason = reason
    this.crimeScene = perp.currRoom
    print(
      '___=> Behavior: SnitchSEQUENCE: New: Created For::',
      this.a.name,
      'against:',
      this.perp.name,
      'in',
      this.crimeScene
    )
    if (this.a.turnPriority < 94) this.a.updateFromBehavior('turnPriority', 94)
    this.a.cooldown = 9
  }
  update(reason: string) {
    print(
      '^^^ => Behavior: SnitchSequence:: Update: extended for: name, cooldown, incidents:',
      this.a.name,
      this.a.cooldown,
      this.incidents
    )
    if (crimeSeverity[reason] > crimeSeverity[this.reason]) this.reason = reason
    this.a.cooldown = this.a.cooldown + 12
    this.incidents++
  }
  run(): 'REMOVE' | '' {
    if (this.a.turnPriority < 94) this.a.updateFromBehavior('turnPriority', 94)

    for (const child of this.children) {
      const proceed = child.run()()
      print(
        '$$$ => Behavior: SnitchSEQUENCE::: Proceed::',
        this.a.name,
        ':',
        proceed
      )
      if (proceed === 'continue') {
        this.a.cooldown--
        // this.a.addToBehavior(
        //   'active',
        //   new SnitchSequence(this.getProps, this.perp, this.reason)
        // )
        if (
          this.a.behavior.place.children.length < 1 &&
          this.a.turnPriority < 97
        )
          this.a.addToBehavior(
            'place',
            new ScoutSequence(this.getProps, this.crimeScene)
          )
      } else {
        this.a.cooldown = 0
      }
    }
    // print('INJUREDSEQUENCE::: COMPLETE:: Remove?')
    if (this.a.cooldown < 1) {
      if (this.a.turnPriority < 95)
        this.a.updateFromBehavior('turnPriority', math.random(10, 33))
      print(
        'XXX => Behavior: SnitchSequence:: Remove: should remove seq for',
        this.a.name
      )
      return 'REMOVE'
    }
    return ''
  }
}
