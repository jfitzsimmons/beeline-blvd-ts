import { InfirmedProps } from '../../../types/behaviors'
import { SECURITY } from '../../utils/consts'
import Action from '../action'
//import PlaceSequence from '../sequences/placeSequence'

export default class JailedAction extends Action {
  a: InfirmedProps
  incidents: number
  constructor(a: InfirmedProps) {
    super()
    this.a = a
    this.a.cooldown = 16
    this.incidents = 0
  }
  update() {
    this.a.cooldown = this.a.cooldown + 24
    this.incidents++
    print(
      '^^^ => Behavior: JailedAction:: Update: Sentence extended for: name, cooldown, incidents:',
      this.a.name,
      this.a.cooldown,
      this.incidents
    )
  }
  run(): { (): void } {
    print('JailedAction for::', this.a.name)
    this.a.cooldown--
    Object.values(this.a.getOccupants('security')).some((o) =>
      SECURITY.includes(o)
    ) && Math.random() > 0.3
      ? (this.a.cooldown = this.a.cooldown - 2)
      : Math.random() > 0.3 && this.a.cooldown--

    print(
      'JailedAction::',
      this.a.name,
      'jailed for another Turn. Cooldown:',
      this.a.cooldown
    )
    if (this.a.cooldown < 1) {
      print('JailedAction:: cooldown reset. RE-PLACE npc??')
      return () => this.success()
    }
    //  }
    return () => this.continue('continue')
  }
}
