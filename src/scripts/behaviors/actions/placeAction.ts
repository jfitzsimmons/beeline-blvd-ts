import { ActionProps, PlaceProps } from '../../../types/behaviors'
import Action from '../action'

export default class PlaceAction extends Action {
  a: PlaceProps
  constructor(props: ActionProps) {
    super(props)
    this.a = props as PlaceProps
  }

  run(): { (): void } {
    if (this.a.cooldown > 0) this.a.cooldown = this.a.cooldown - 1
    this.a.exitRoom = this.a.currRoom
    print('findRoomPlaceStation REGPLACEACTION:', this.a.name)

    this.a.findRoomPlaceStation()

    return () => this.success()
  }
  success() {
    // if (isNpc(this.a))
    // prettier-ignore
    //print('PlaceAction:: Success::', this.a.name, 'placedin:', this.a.currRoom, this.a.currStation, '||| from:',   this.a.exitRoom ) //testjpf
  }
}
