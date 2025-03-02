import { InfirmedProps } from '../../../types/behaviors'
import { security } from '../../utils/consts'
import Action from '../action'
//import PlaceSequence from '../sequences/placeSequence'

export default class JailedAction extends Action {
  a: InfirmedProps
  constructor(a: InfirmedProps) {
    super(a)
    this.a = a
  }
  run(): { (): void } {
    print('JailedAction for::', this.a.name)

    Object.values(this.a.getOccupants('security')).some((o) =>
      security.includes(o)
    ) && Math.random() > 0.3
      ? (this.a.cooldown = this.a.cooldown + 2)
      : Math.random() > 0.3 && (this.a.cooldown = this.a.cooldown + 1)
    if (this.a.cooldown < 1) {
      this.a.sincePlayerRoom = math.random(15, 40)
      //this.a.removeInfirmed(this.a.name)
      print('INFIRMEDaction:: sinceplayerroom reset. RE-PLACE npc??')
      return () => this.success()
    }
    //  }
    return () => this.continue('continue')
  }
}
