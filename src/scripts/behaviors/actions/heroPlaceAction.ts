import {
  ActionProps,
  HeroBehaviorKeys,
  HeroPlaceProps,
} from '../../../types/behaviors'
//import { RoomsInitState } from '../../states/inits/roomsInitState'
import Action from '../action'

export default class HeroPlaceAction extends Action {
  a: HeroPlaceProps
  getProps: (behavior: HeroBehaviorKeys) => ActionProps
  constructor(getProps: (behavior: HeroBehaviorKeys) => ActionProps) {
    const props = getProps('place') as HeroPlaceProps
    super()
    this.a = props
    this.getProps = getProps
  }
  run(): { (): void } {
    if (this.a.cooldown > 0) this.a.cooldown = this.a.cooldown - 1

    this.a.setRoomInfo()
    print('||>> PLACEsequence:: setRoomInfo HEROPLACEACTION:', this.a.name)

    return () => this.success()
  }
}
