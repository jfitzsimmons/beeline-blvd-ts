import ActorState from '../../states/actor'
import { isNpc } from '../../utils/ai'
import Action from '../action'
//import MenderSequence from '../sequences/menderSequence'

export default class MenderAction extends Action {
  mendee: string
  constructor(a: ActorState, mendee: string) {
    super(a)
    this.mendee = mendee
  }
  run(): { (): void } {
    const { actor: a } = this
    //testjpf oninjurystart
    if (isNpc(a)) {
      a.sincePlayerRoom = 97
      a.parent.pruneStationMap(a.currRoom, a.currStation)
      if (a.parent.returnNpc(this.mendee).hp < 5) {
        print('Tryingtokeep mendering!!!')
        return () =>
          this.continue(
            `${a.name} is continuing another MenderSequence on: ${this.mendee}`
          )
      }
    }
    /**
     * testjpf
     * need mender task stuff here?
     * tasksys addressbusy
     *
     * this.parent.taskBuilder(doc, 'mender', p, 'injury')
     */
    // if (a instanceof NpcState && a.parent.returnNpc(this.mendee).hp > 5)

    return () => this.success()
  }
}
