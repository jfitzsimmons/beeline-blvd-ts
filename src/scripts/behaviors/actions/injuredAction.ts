import ActorState from '../../states/actor'
import { NpcsInitState } from '../../states/inits/npcsInitState'
import NpcState from '../../states/npc'
import { isNpc } from '../../utils/ai'
import Action from '../action'
import Sequence from '../sequence'
import MenderSequence from '../sequences/menderSequence'
import MendeeAction from './mendeeAction'

export default class InjuredAction extends Action {
  a: ActorState
  doc = ''
  constructor(a: ActorState) {
    super(a)
    this.a = a
  }
  run(): { (): void } {
    if (this.a instanceof NpcState) {
      this.a.sincePlayerRoom = 99
      if (this.a.parent.getIgnore().includes(this.a.name))
        return () =>
          this.continue(
            'Injur-ED-action:: IGNORE - Quest related NPC:' + this.a.name
          )

      const helpers = Object.values(this.a.parent.getOccupants(this.a.currRoom))
        .filter((s) => s != '')
        .sort(function (a, b) {
          if (a.slice(0, 3) === 'doc' && b.slice(0, 3) !== 'doc') return -1
          if (b.slice(0, 3) === 'doc' && a.slice(0, 3) !== 'doc') return 1
          return 0
        })
      for (const helper of helpers) {
        if (this.a.parent.returnNpc(helper).sincePlayerRoom < 97) {
          //doctors start mending after RNG weighted by patient priority
          const ticket = this.a.parent.getMendingQueue().indexOf(this.a.name)
          const random = math.random(0, 4)
          if (
            NpcsInitState[helper].clan == 'doctors' &&
            ((ticket != -1 && ticket < random) || (ticket == -1 && random > 3))
          ) {
            const testjpf = this.a.parent.returnNpc(helper)
            print(
              'INJUREDACTION::: DOC::',
              helper,
              'ismending',
              this.a.name,
              testjpf.currRoom,
              testjpf.currStation
            )
            this.doc = helper
            return () => this.alternate(new MendeeAction(this.a))
          } else if (
            math.random() > 0.7 &&
            this.a.parent.npcHasTask([helper], [this.a.name]) === null &&
            NpcsInitState[helper].clan !== 'doctors'
          ) {
            //if not a doctor, create injury caution if haven't already
            //testjpf probably an ACTION::
            this.a.parent.taskBuilder(helper, 'injury', this.a.name, 'injury')
            break
          } else if (NpcsInitState[helper].clan == 'doctors') {
            this.a.parent.addAdjustMendingQueue(this.a.name)
          }
        }
      }
    } else {
      return () => this.fail('FAIL404 - no InjuredAction for Player')
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
    if (isNpc(this.a)) {
      const doc = this.a.parent.returnNpc(this.doc)
      doc.sincePlayerRoom = 98
      print(
        'injuredAction:: alternate doc mender sequence:: doc,a:',
        this.doc,
        this.a.name,
        doc.behavior.active.children.length,
        doc.currRoom,
        doc.currStation
      )
      doc.behavior.active.children.push(new MenderSequence(doc, this.a.name))
      print(
        'injuredAction:: alternate doc mender sequence:: doc,a:',
        this.doc,
        this.a.name,
        doc.behavior.active.children.length
      )
    }
    // new MenderSequence(this.a.parent.returnNpc(this.doc), this.a.name).run()
    return as instanceof Action ? as.run()() : as.run()
  }
}
