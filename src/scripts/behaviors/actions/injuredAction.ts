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
    const { actor: a } = this
    //testjpf oninjurystart
    if (a instanceof NpcState) {
      a.sincePlayerRoom = 99
      // a.parent.addInjured(a.name)
      if (a.parent.getIgnore().includes(a.name))
        return () =>
          this.continue(
            'Injur-ED-action:: IGNORE - Quest related NPC:' + a.name
          )
      //return () => this.fail('FAILignore - must ignore injured:::' + a.name)

      const helpers = Object.values(a.parent.getOccupants(a.currRoom))
        .filter((s) => s != '')
        .sort(function (a, b) {
          if (a.slice(0, 3) === 'doc' && b.slice(0, 3) !== 'doc') return -1
          if (b.slice(0, 3) === 'doc' && a.slice(0, 3) !== 'doc') return 1
          return 0
        })
      for (const helper of helpers) {
        //doctors start mending after RNG weighted by patient priority
        const ticket = a.parent.getMendingQueue().indexOf(a.name)
        const random = math.random(0, 4)
        if (
          NpcsInitState[helper].clan == 'doctors' &&
          ((ticket != -1 && ticket < random) || (ticket == -1 && random > 3))
        ) {
          /**
           * TESTJPF STARTHERE
           * This needs to be another action??
           * this whole loop??
           * taskbuilder seems to be create action
           * for another NPC
           *
 
           * KEEP running into post placement and preplacement sequences / behavior
           */
          // a.tendToPatient(a.name, helper)
          print('INJUREDACTION::: DOC::', helper, 'ismending', a.name)
          this.doc = helper
          return () => this.alternate(new MendeeAction(a))
        } else if (
          math.random() > 0.7 &&
          a.parent.npcHasTask([helper], [a.name]) === null &&
          NpcsInitState[helper].clan !== 'doctors'
        ) {
          //if not a doctor, create injury caution if haven't already
          //testjpf probably an ACTION::
          a.parent.taskBuilder(helper, 'injury', a.name, 'injury')
          break
        }
      }
    } else {
      return () => this.fail('FAIL404 - no InjuredAction for Player')
    }
    return () =>
      this.continue(
        'Injur-ED-action:: Default - Add Another InjuredSequence for:' + a.name
      )
  }
  continue(s: string): string {
    print('Injur-ed-Action:: Continue:', s)
    return 'continue'
  }
  alternate(as: Action | Sequence): string | void {
    if (isNpc(this.a)) {
      const doc = this.a.parent.returnNpc(this.doc)
      doc.behavior.active.children.push(new MenderSequence(doc, this.a.name))
    }
    // new MenderSequence(this.a.parent.returnNpc(this.doc), this.a.name).run()
    return as instanceof Action ? as.run()() : as.run()
  }
}
