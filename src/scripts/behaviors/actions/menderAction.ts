import { InjuredProps, MenderProps } from '../../../types/behaviors'
//import ActorState from '../../states/actor'
import Action from '../action'

export default class MenderAction extends Action {
  mendee: InjuredProps
  a: MenderProps
  constructor(a: MenderProps, mendee: InjuredProps) {
    super(a)
    this.mendee = mendee
    this.a = a
  }
  run(): { (): void } {
    // const { actor: a } = this
    const mendee = this.a.returnNpc(this.mendee.name)
    print('FROMMENDER:: Mendee HP:::', this.mendee.name, mendee.hp)
    if (mendee.hp < 5) {
      // this.a.turnPriority = 98
      if (this.a.currRoom == this.a.getFocusedRoom()) {
        msg.post(`/${this.a.currStation}#npc_loader`, hash('move_npc'), {
            station: this.mendee.currStation,
            npc: this.a.name,
          })
        // prettier-ignore
        //print(ts[i].owner, 'STATION MOVE VIA TASK mending', ts[i].target, 'in', npcs.all[ts[i].owner].currRoom)
      }
      return () => this.continue('continue')
    } else {
      print(`${this.a.name} has successfully Mended ${this.mendee.name}`)
      return () => this.success()
    }
  }
  continue(s: string): string {
    print(
      `${this.a.name} is continuing another MenderSequence on: ${this.mendee.name}`
    )
    return s
  }
}
