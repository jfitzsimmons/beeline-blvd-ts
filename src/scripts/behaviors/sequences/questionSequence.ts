import {
  ActionProps,
  BehaviorKeys,
  InjuredProps,
} from '../../../types/behaviors'
import Action from '../action'
//import InjuredAction from '../actions/injuredAction'
import QuestionAction from '../actions/questionAction'
import Sequence from '../sequence'
//import ImmobileSequence from './immobileSequence'
//import MendeeSequence from './mendeeSequence'

export default class QuestionSequence extends Sequence {
  a: InjuredProps
  getProps: (behavior: BehaviorKeys) => () => ActionProps
  constructor(getProps: (behavior: BehaviorKeys) => () => ActionProps) {
    const props = getProps('injured')() as InjuredProps
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
    turnActions.push(...[new QuestionAction(getProps)])
    super(turnActions)
    this.a = props
    this.getProps = getProps
  }
  run(): 'REMOVE' | '' {
    this.a.sincePlayerRoom = 99
    for (const child of this.children) {
      const proceed = child.run()()
      print('INJUREDSEQUENCE::: Proceed::', this.a.name, ':', proceed)
      if (proceed === 'continue') {
        //this.a.addToBehavior('active', new InjuredSequence(this.getProps))
        //   this.a.addToBehavior('place', new ImmobileSequence(this.getProps))
      } else if (proceed == 'mend') {
        //   this.a.addToBehavior('active', new MendeeSequence(this.getProps))
        //  this.a.addToBehavior('place', new ImmobileSequence(this.getProps))
      }
    }
    return 'REMOVE'
  }
}
