import { GetProps, PlaceProps } from '../../../types/behaviors'
import {
  RoomsInitState,
  RoomsInitPriority,
} from '../../states/inits/roomsInitState'
import Action from '../action'

export default class PlaceAction extends Action {
  a: PlaceProps
  getProps: GetProps
  constructor(getProps: GetProps) {
    const props = getProps('place') as PlaceProps
    super()
    this.a = props
    this.getProps = getProps
  }
  run(): { (): void } {
    if (this.a.cooldown > 0) this.a.cooldown = this.a.cooldown - 1
    this.a.exitRoom = this.a.currRoom
    print(
      '||>> Behavior: PlaceAction: findRoomPlaceStation REGPLACEACTION:',
      this.a.name
    )
    if (this.a.turnPriority == 94 && math.random() > 0.3) {
      this.a.findRoomPlaceStation(
        RoomsInitState[
          RoomsInitPriority[math.random(0, RoomsInitPriority.length - 1)]
        ].matrix
      )
      print(
        '|> Behavior: PlaceAction: findRoomPlaceStation RANDOM94:',
        this.a.name
      )
      return () => this.success()
    }
    this.a.findRoomPlaceStation()

    return () => this.success()
  }
  success() {
    // if (isNpc(this.a))
    // prettier-ignore
    //print('PlaceAction:: Success::', this.a.name, 'placedin:', this.a.currRoom, this.a.currStation, '||| from:',   this.a.exitRoom ) 
  }
}
