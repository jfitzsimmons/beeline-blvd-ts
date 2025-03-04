import { InfirmedProps } from '../../../types/behaviors'
import { doctors } from '../../utils/consts'
import Action from '../action'
//import PlaceSequence from '../sequences/placeSequence'

export default class InfirmedAction extends Action {
  a: InfirmedProps
  constructor(a: InfirmedProps) {
    super(a)
    this.a = a
  }
  run(): { (): void } {
    print('infirmEDAction for::', this.a.name)

    Object.values(this.a.getOccupants('infirmary')).some((o) =>
      doctors.includes(o)
    ) && Math.random() > 0.3
      ? (this.a.hp = this.a.hp + 2)
      : Math.random() > 0.3 && (this.a.hp = this.a.hp + 1)
    if (this.a.hp > 9) {
      // this.a.removeInfirmed(this.a.name)
      print('INFIRMEDaction:: turnPriority reset. RE-PLACE npc??')
      return () => this.success()
    }
    //  }
    return () => this.continue('continue')
  }
}
