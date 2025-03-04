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
    super(props)
    this.a = props
    this.getProps = getProps
  }
  run(): { (): void } {
    if (this.a.cooldown > 0) this.a.cooldown = this.a.cooldown - 1

    this.a.setRoomInfo()
    print('findRoomPlaceStation REGPLACEACTION:', this.a.name)

    //this.a.findRoomPlaceStation()
    /**
     * testjpf
     * if this.a.clearance < than currroom.clearance
     * return alternate(TrespassSeq)!!!??
     */

    //if (this.a.clearance < RoomsInitState[this.a.currRoom].clearance) {
    // return () => this.continue('trespass')
    //// }

    return () => this.success()
  }
  success() {
    // if (isNpc(this.a))
    // prettier-ignore
    //print('PlaceAction:: Success::', this.a.name, 'placedin:', this.a.currRoom, this.a.currStation, '||| from:',   this.a.exitRoom ) //testjpf
  }
}
