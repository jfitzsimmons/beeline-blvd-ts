import ActorState from '../../states/actor'
import { isNpc } from '../../utils/ai'
import Action from '../action'

export default class MenderAction extends Action {
  mendee: string
  a: ActorState
  constructor(a: ActorState, mendee: string) {
    super(a)
    this.mendee = mendee
    this.a = a
  }
  run(): { (): void } {
    const { actor: a } = this
    //testjpf oninjurystart
    if (isNpc(a)) {
      print('FROMMENDER:: Mendee HP:::', a.parent.returnNpc(this.mendee).hp)
      if (a.parent.returnNpc(this.mendee).hp < 5) {
        //a.parent.pruneStationMap(a.currRoom, a.currStation)
        a.sincePlayerRoom = 98
        print('Tryingtokeep mendering!!!')
        //testjpf Maybe make AttendToAction ??
        if (
          isNpc(this.a) &&
          this.a.currRoom == this.a.parent.getFocusedRoom()
        ) {
          msg.post(`/${this.a.currStation}#npc_loader`, hash('move_npc'), {
            station: this.a.parent.returnNpc(this.mendee).currStation,
            npc: this.a.name,
          })
          // prettier-ignore
          //print(ts[i].owner, 'STATION MOVE VIA TASK mending', ts[i].target, 'in', npcs.all[ts[i].owner].currRoom)
        }
        return () => this.continue('continue')
      } else {
        a.sincePlayerRoom = math.random(10, 30)
        print(`${this.a.name} has successfully Mended ${this.mendee}`)
        return () => this.success()
      }
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
  continue(s: string): string {
    print(
      `${this.a.name} is continuing another MenderSequence on: ${this.mendee}`
    )
    return s
  }
}
