import ActorState from '../../states/actor'
import {
  RoomsInitLayout,
  RoomsInitState,
} from '../../states/inits/roomsInitState'
import { isNpc } from '../../utils/ai'
import Action from '../action'
import InjuryAction from './injuryAction'

export default class PlaceAction extends Action {
  constructor(a: ActorState) {
    super(a)
  }
  run(): { (): void } {
    const { actor: a } = this
    if (a.cooldown > 0) a.cooldown = a.cooldown - 1

    a.exitRoom = RoomsInitLayout[a.matrix.y][a.matrix.x]!

    if (a.hp < 1) {
      //testjpf create injuryaction
      //alternate logic??
      print('PlaceAction:: hp<1:', a.name)
      return () => this.alternate(new InjuryAction(a))
    }

    if (isNpc(a)) {
      print('ISNPCUTIL!!!:::', isNpc(a))
      a.parent.clearStation(a.currRoom, a.currStation, a.name)

      const target = RoomsInitState[a.parent.getPlayerRoom()].matrix
      const rooms = a.makePriorityRoomList(target)
      a.findRoomPlaceStation(rooms)
    }

    //if (testjpfimmobile) return () => this.alternate(ImmobileAction(this))
    //  if (testjpf) return () => this.fail('youfailed')
    return () => this.success()
  }
}
