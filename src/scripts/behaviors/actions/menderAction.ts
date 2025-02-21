import ActorState from '../../states/actor'
import { isNpc } from '../../utils/ai'
import Action from '../action'

export default class MenderAction extends Action {
  constructor(a: ActorState) {
    super(a)
  }
  run(): { (): void } {
    const { actor: a } = this
    //testjpf oninjurystart
    if (isNpc(a)) {
      a.sincePlayerRoom = 97
      a.parent.pruneStationMap(a.currRoom, a.currStation)
    }
    /**
     * testjpf
     * need mender task stuff here?
     * tasksys addressbusy
     *
     * this.parent.taskBuilder(doc, 'mender', p, 'injury')
     */

    return () => this.success()
  }
}
