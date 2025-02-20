import ActorState from '../../states/actor'
import {
  RoomsInitLayout,
  RoomsInitPriority,
  RoomsInitState,
} from '../../states/inits/roomsInitState'
import { isNpc } from '../../utils/ai'
import Action from '../action'
import InjuryAction from './injuryAction'

export default class PlaceAction extends Action {
  constructor(a: ActorState) {
    super(a)
  }
  success() {
    // no log
  }
  run(): { (): void } {
    const { actor: a } = this
    a.exitRoom = RoomsInitLayout[a.matrix.y][a.matrix.x]!
    if (a.cooldown > 0) a.cooldown = a.cooldown - 1
    if (a.hp < 1) {
      return () => this.alternate(new InjuryAction(a))
    }

    if (isNpc(a)) {
      a.parent.clearStation(a.currRoom, a.currStation, a.name)
      const rooms =
        a.currRoom !== ''
          ? a.makePriorityRoomList(
              RoomsInitState[a.parent.getPlayerRoom()].matrix
            )
          : RoomsInitPriority
      a.findRoomPlaceStation(rooms)
    }

    return () => this.success()
  }
}
