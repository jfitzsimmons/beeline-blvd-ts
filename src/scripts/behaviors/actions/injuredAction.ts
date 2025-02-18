import ActorState from '../../states/actor'
import { NpcsInitState } from '../../states/inits/npcsInitState'
import NpcState from '../../states/npc'
import Action from '../action'

export default class InjuredAction extends Action {
  constructor(a: ActorState) {
    super(a)
  }
  run(): { (): void } {
    const { actor: a } = this
    //testjpf oninjurystart
    if (a instanceof NpcState) {
      a.sincePlayerRoom = 99
      // a.parent.addInjured(a.name)

      a.parent.pruneStationMap(a.currRoom, a.currStation)
      if (a.parent.getIgnore().includes(a.name))
        return () => this.fail('FAILignore - must ignore injured:::' + a.name)

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
           */
          a.tendToPatient(a.name, helper)
          break
        } else if (
          math.random() > 0.7 &&
          a.parent.npcHasTask([helper], [a.name]) === null &&
          NpcsInitState[helper].clan !== 'doctors'
        ) {
          //if not a doctor, create injury caution if haven't already
          a.parent.taskBuilder(helper, 'injury', a.name, 'injury')
          break
        }
      }
    } else {
      return () => this.fail('FAIL404 - no InjuredAction for Player')
    }
    return () => this.success()
  }
}
