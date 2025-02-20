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
    if (a.cooldown > 0) a.cooldown = a.cooldown - 1

    a.exitRoom = RoomsInitLayout[a.matrix.y][a.matrix.x]!
    print('placeactionhp::', a.hp, a.name)
    if (a.hp < 1) {
      //testjpf create injuryaction
      //alternate logic??
      return () => this.alternate(new InjuryAction(a))
    }

    if (isNpc(a)) {
      a.parent.clearStation(a.currRoom, a.currStation, a.name)

      // const target = RoomsInitState[a.parent.getPlayerRoom()].matrix
      const rooms =
        a.currRoom !== ''
          ? a.makePriorityRoomList(
              RoomsInitState[a.parent.getPlayerRoom()].matrix
            )
          : RoomsInitPriority
      a.findRoomPlaceStation(rooms)
    }

    //if (testjpfimmobile) return () => this.alternate(ImmobileAction(this))
    //  if (testjpf) return () => this.fail('youfailed')
    return () => this.success()
  }
}
