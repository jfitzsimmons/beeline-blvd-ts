import ActorState from '../../states/actor'
import {
  RoomsInitLayout,
  RoomsInitPriority,
  RoomsInitState,
} from '../../states/inits/roomsInitState'
import { isNpc } from '../../utils/ai'
import Action from '../action'
import ImmobileAction from './immobileAction'
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
    if (a.cooldown > 0) a.cooldown = a.cooldown - 1
    a.exitRoom = RoomsInitLayout[a.matrix.y][a.matrix.x]!
    if (isNpc(a) && a.sincePlayerRoom > 89) {
      return () => this.alternate(new ImmobileAction(a))
    }
    if (a.hp < 1) {
      return () => this.alternate(new InjuryAction(a))
    }
    /**
     * if (immobile) immobileAction>}????
     *this is how you do immobile
     export const immobile = ['mender', 'mendee', 'injury', 'infirm']
    if turns > 90 ??
     */
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
