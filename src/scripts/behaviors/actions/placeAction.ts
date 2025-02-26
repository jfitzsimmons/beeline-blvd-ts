import { ActionProps, PlaceProps } from '../../../types/behaviors'
import { RoomsInitLayout } from '../../states/inits/roomsInitState'
//import { isNpc } from '../../utils/ai'
import Action from '../action'

export default class PlaceAction extends Action {
  a: PlaceProps
  constructor(props: ActionProps) {
    //const props = getProps('place') as PlaceProps
    super(props)
    this.a = props as PlaceProps
  }

  run(): { (): void } {
    // const { actor: a } = this
    if (this.a.cooldown > 0) this.a.cooldown = this.a.cooldown - 1
    this.a.exitRoom = RoomsInitLayout[this.a.matrix.y][this.a.matrix.x]!

    // this.a.parent.clearStation(this.a.currRoom, this.a.currStation, this.a.name)
    /**
    const rooms =
      this.a.currRoom !== ''
        ? this.a.makePriorityRoomList(
            RoomsInitState[this.a.parent.getPlayerRoom()].matrix
          )
        : RoomsInitPriority
        */
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
