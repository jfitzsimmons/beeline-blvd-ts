import {
  ActionProps,
  BehaviorKeys,
  HelperProps,
} from '../../../types/behaviors'
import Action from '../action'
import HelperAction from '../actions/helperAction'
import Sequence from '../sequence'
import ScoutSequence from './scoutSequence'

export default class HelperSequence extends Sequence {
  a: HelperProps
  victim = ''
  getProps: (behavior: BehaviorKeys) => ActionProps
  constructor(
    getProps: (behavior: BehaviorKeys) => ActionProps,
    victim: string
  ) {
    /**testjpf
     * do something like
     * constructor(getProps: () => ActionProps)
     */
    const props = getProps('helper') as HelperProps
    // print('CLASSinjuredseq created for:::', a.name)
    const turnActions: Action[] = []

    turnActions.push(...[new HelperAction(getProps, victim)])

    super(turnActions)
    this.a = props
    this.getProps = getProps
    this.victim = victim
  }
  run(): 'REMOVE' | '' {
    // this.a.sincePlayerRoom = 99
    //for (let i = 0; i < this.children.length; i++) {
    for (const child of this.children) {
      const proceed = child.run()()
      print('helperSEQUENCE::: Proceed::', this.a.name, ':', proceed)
      //const props = this.getProps('immobile') as ImmobileProps

      if (proceed === 'continue') {
        this.a.addToBehavior(
          'active',
          new HelperSequence(this.getProps, this.victim)
        )
        //testjpf maybe a new ScoutPlaceSequence?
        this.a.addToBehavior(
          'place',
          new ScoutSequence(
            this.getProps,
            this.a.returnNpc(this.victim).currRoom
          )
        )
      }
    }
    // print('INJUREDSEQUENCE::: COMPLETE:: Remove?')

    return 'REMOVE'
  }
}
