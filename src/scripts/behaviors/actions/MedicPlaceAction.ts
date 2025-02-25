import ActorState from '../../states/actor'
import {
  RoomsInitLayout,
  RoomsInitPriority,
  RoomsInitState,
} from '../../states/inits/roomsInitState'
import { isNpc } from '../../utils/ai'
import Action from '../action'

export default class MedicPlaceAction extends Action {
  a: ActorState
  constructor(a: ActorState) {
    super(a)
    this.a = a
  }

  run(): { (): void } {
    // const { actor: a } = this
    if (this.a.cooldown > 0) this.a.cooldown = this.a.cooldown - 1
    this.a.exitRoom = RoomsInitLayout[this.a.matrix.y][this.a.matrix.x]!

    if (isNpc(this.a)) {
      this.a.parent.clearStation(
        this.a.currRoom,
        this.a.currStation,
        this.a.name
      )
      const rooms =
        this.a.currRoom !== ''
          ? this.a.makePriorityRoomList(
              RoomsInitState[this.a.parent.getPlayerRoom()].matrix
            )
          : RoomsInitPriority
      this.a.findRoomPlaceStation(rooms)
    }

    return () => this.success()
  }
  success() {
    // prettier-ignore
    if (isNpc(this.a))print('MedicPlaceAction:: Success::', this.a.name, 'placedin:', this.a.currRoom, this.a.currStation, '||| from:',   this.a.exitRoom ) //testjpf
  }
}
