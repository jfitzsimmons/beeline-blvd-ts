import { InjuredProps, MenderProps } from '../../../types/behaviors'
//import ActorState from '../../states/actor'
import Action from '../action'

export default class MenderAction extends Action {
  mendee: InjuredProps
  a: MenderProps
  constructor(a: MenderProps, mendee: InjuredProps) {
    super()
    this.mendee = mendee
    this.a = a
    if (this.a.currRoom == this.a.getFocusedRoom()) {
      msg.post(`/${this.a.currStation}#npc_loader`, hash('move_npc'), {
        station: this.mendee.currStation,
        npc: this.a.name,
      })
      // prettier-ignore
      print('newnew',this.a.name,this.a.currStation, 'STATION MOVE VIA TASK mender', this.mendee.name,this.mendee.currStation, 'in', this.a.currRoom)
    }
  }
  run(): { (): void } {
    const mendee = this.a.returnNpc(this.mendee.name)
    if (mendee.hp < 5) {
      if (this.a.currRoom == this.a.getFocusedRoom()) {
        msg.post(`/${this.a.currStation}#npc_loader`, hash('move_npc'), {
          station: this.mendee.currStation,
          npc: this.a.name,
        })
        // prettier-ignore
        print('runrun',this.a.name,this.a.currStation, 'STATION MOVE VIA TASK mender', this.mendee.name, 'in', this.a.currRoom)
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
