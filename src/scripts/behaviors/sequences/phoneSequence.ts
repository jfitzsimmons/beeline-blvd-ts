import {
  ActionProps,
  BehaviorKeys,
  HelperProps,
} from '../../../types/behaviors'
import { crimeSeverity } from '../../utils/ai'
import Action from '../action'
import PhoneAction from '../actions/phoneAction'
import SnitchAction from '../actions/snitchAction'
//import HelperAction from '../actions/helperAction'
import Sequence from '../sequence'
import ImmobileSequence from './immobileSequence'
import SnitchSequence from './snitchSequence'

export default class PhoneSequence extends Sequence {
  a: HelperProps
  perp: HelperProps
  reason: string
  getProps: (behavior: BehaviorKeys) => ActionProps
  crimeScene: string
  incidents = 0
  constructor(
    getProps: (behavior: BehaviorKeys) => ActionProps,
    perp: HelperProps,
    reason: string
  ) {
    const props = getProps('helper') as HelperProps
    const turnActions: Action[] = []

    turnActions.push(
      ...[
        new SnitchAction(getProps, perp, reason),
        new PhoneAction(getProps, perp, reason),
      ]
    )

    super(turnActions)
    this.a = props
    this.getProps = getProps
    this.perp = perp
    this.reason = reason
    this.crimeScene = perp.currRoom
    this.a.cooldown = 8

    print(
      'PhoneSEQUENCE::: Created For::',
      this.a.name,
      'against:',
      this.perp.name,
      'in',
      this.crimeScene
    )

    if (this.a.currRoom == this.a.getFocusedRoom()) {
      msg.post(`/${this.a.currStation}#npc_loader`, hash('move_npc'), {
        station: 'phone',
        npc: this.a.name,
      })
      // prettier-ignore
      print(this.a.name, 'STATION MOVE VIA NEW PHONeSequence in', this.a.currRoom)
    }
  }
  update(reason: string) {
    print(
      'phoneSequence:: Update: extended for: name, cooldown, incidents:',
      this.a.name,
      this.a.cooldown,
      this.incidents
    )
    if (crimeSeverity[reason] > crimeSeverity[this.reason]) this.reason = reason
    this.a.cooldown = this.a.cooldown + 10
    this.incidents++
  }
  run(): 'REMOVE' | '' {
    for (const child of this.children) {
      const proceed = child.run()()
      print('PhoneSEQUENCE::: Proceed::', this.a.name, ':', proceed)
      if (proceed === 'phone') {
        this.a.cooldown--
        this.a.addToBehavior(
          'active',
          new PhoneSequence(this.getProps, this.perp, this.reason)
        )
        this.a.addToBehavior('place', new ImmobileSequence(this.getProps))
      } else if (proceed === 'busy') {
        this.a.updateFromBehavior('turnPriority', math.random(10, 30))
        this.a.addToBehavior(
          'active',
          new SnitchSequence(this.getProps, this.perp, this.reason)
        )
        this.a.cooldown = 0
      } else if (proceed !== 'continue') {
        this.a.cooldown = 0
      }
    }
    if (this.a.cooldown < 1) {
      print('QuestionSequence:: should remove seq for', this.a.name)
      return 'REMOVE'
    }
    return ''
  }
}
