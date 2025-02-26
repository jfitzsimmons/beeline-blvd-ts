import { MenderProps } from '../../../types/behaviors'
//import ActorState from '../../states/actor'
import Action from '../action'

export default class MenderAction extends Action {
  mendee: string
  a: MenderProps
  constructor(a: MenderProps, mendee: string) {
    super(a)
    this.mendee = mendee

    this.a = a
  }
  run(): { (): void } {
    // const { actor: a } = this
    print('FROMMENDER:: Mendee HP:::', this.a.returnNpc(this.mendee).hp)
    if (this.a.returnNpc(this.mendee).hp < 5) {
      this.a.sincePlayerRoom = 98
      if (this.a.currRoom == this.a.getFocusedRoom()) {
        msg.post(`/${this.a.currStation}#npc_loader`, hash('move_npc'), {
            station: this.a.returnNpc(this.mendee).currStation,
            npc: this.a.name,
          })
        // prettier-ignore
        //print(ts[i].owner, 'STATION MOVE VIA TASK mending', ts[i].target, 'in', npcs.all[ts[i].owner].currRoom)
      }
      return () => this.continue('continue')
    } else {
      this.a.sincePlayerRoom = math.random(10, 30)
      print(`${this.a.name} has successfully Mended ${this.mendee}`)
      return () => this.success()
    }
  }
  continue(s: string): string {
    print(
      `${this.a.name} is continuing another MenderSequence on: ${this.mendee}`
    )
    return s
  }
}
