import {
  ActionProps,
  BehaviorKeys,
  InjuredProps,
} from '../../../types/behaviors'
import { NpcsInitState } from '../../states/inits/npcsInitState'
import Action from '../action'
import Sequence from '../sequence'
import MenderSequence from '../sequences/menderSequence'
import MendeeAction from './mendeeAction'

export default class InjuredAction extends Action {
  a: InjuredProps
  doc = ''
  getProps: (behavior: BehaviorKeys) => ActionProps
  constructor(getProps: (behavior: BehaviorKeys) => ActionProps) {
    const props = getProps('injured') as InjuredProps
    super(props)
    this.a = props
    this.getProps = getProps
  }
  run(): { (): void } {
    this.a.sincePlayerRoom = 99
    if (this.a.getIgnore().includes(this.a.name))
      return () =>
        this.continue(
          'Injur-ED-action:: IGNORE - Quest related NPC:' + this.a.name
        )

    const helpers = Object.values(this.a.getOccupants(this.a.currRoom))
      .filter((s) => s != '')
      .sort(function (a, b) {
        if (a.slice(0, 3) === 'doc' && b.slice(0, 3) !== 'doc') return -1
        if (b.slice(0, 3) === 'doc' && a.slice(0, 3) !== 'doc') return 1
        return 0
      })
    for (const helper of helpers) {
      if (this.a.returnNpc(helper).sincePlayerRoom < 97) {
        //doctors start mending after RNG weighted by patient priority
        const ticket = this.a.getMendingQueue().indexOf(this.a.name)
        const random = math.random(0, 4)
        if (
          NpcsInitState[helper].clan == 'doctors' &&
          ((ticket != -1 && ticket < random) || (ticket == -1 && random > 3))
        ) {
          this.doc = helper
          //const props = this.getProps('mendee')
          return () => this.alternate(new MendeeAction(this.getProps))
        } else if (
          math.random() > 0.7 &&
          // this.a.parent.npcHasTask([helper], [this.a.name]) === null &&
          NpcsInitState[helper].clan !== 'doctors'
        ) {
          //if not a doctor, create injury caution if haven't already
          //testjpf probably an ACTION::
          //TODO NEXT START HERE!!!
          //   this.a.parent.taskBuilder(helper, 'injury', this.a.name, 'injury')
          break
        } else if (NpcsInitState[helper].clan == 'doctors') {
          this.a.addAdjustMendingQueue(this.a.name)
        }
      }
    }

    return () =>
      this.continue(
        'Injur-ED-action:: Default - Add Another InjuredSequence for:' +
          this.a.name
      )
  }
  continue(s: string): string {
    print('Injur-ed-Action:: Continue:', s)
    return 'continue'
  }
  alternate(as: Action | Sequence): string | void {
    //if (isNpc(this.a)) {
    const doc = this.a.returnNpc(this.doc)
    doc.sincePlayerRoom = 98
    print(
      'injuredAction:: alternate doc mender sequence:: doc,a:',
      this.doc,
      this.a.name,
      doc.behavior.active.children.length,
      doc.currRoom,
      doc.currStation
    )
    doc.behavior.active.children.push(
      new MenderSequence(doc.getBehaviorProps.bind(this), this.a.name)
    )
    print(
      'injuredAction:: alternate doc mender sequence:: doc,a:',
      this.doc,
      this.a.name,
      doc.behavior.active.children.length
    )

    // new MenderSequence(this.a.parent.returnNpc(this.doc), this.a.name).run()
    return as instanceof Action ? as.run()() : as.run()
  }
}
