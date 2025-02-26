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
    //TESTJPF NEED a bulletin board
    if (!isNpc(this.a)) return () => this.fail('MedicPlaceAction::: not npc')
    const mobile = this.a.sincePlayerRoom < 90
    const infirmed = this.a.parent.getInfirmed().length
    let rooms =
      this.a.currRoom !== ''
        ? this.a.makePriorityRoomList(
            RoomsInitState[this.a.parent.getPlayerRoom()].matrix
          )
        : RoomsInitPriority

    this.a.parent.clearStation(this.a.currRoom, this.a.currStation, this.a.name)

    if (mobile === true && infirmed > 1) {
      //const patients = this.a.parent.getInfirmed()
      if (
        math.random() + infirmed * 0.2 > 1 &&
        this.a.parent.getStationMap().infirmary.aid !== undefined
      ) {
        this.a.parent.setStation('infirmary', 'aid', this.a.name)
        this.a.parent.pruneStationMap('infirmary', 'aid')
        print('ERfull 1st')
      } else if (infirmed > 2) {
        const target = RoomsInitState.infirmary.matrix
        rooms = this.a.makePriorityRoomList(target)
        print('ERfull help')
      }
    } else if (
      mobile === true &&
      infirmed < 1 &&
      this.a.parent.getMendingQueue().length > 1
    ) {
      const target =
        RoomsInitState[this.a.parent.returnMendeeLocation()!].matrix
      rooms = this.a.makePriorityRoomList(target)
      print('Paramedic!')
    }
    if (this.a.cooldown > 0) this.a.cooldown = this.a.cooldown - 1
    this.a.exitRoom = RoomsInitLayout[this.a.matrix.y][this.a.matrix.x]!
    this.a.findRoomPlaceStation(rooms)
    return () => this.success()
  }
  success() {
    // prettier-ignore
    if (isNpc(this.a))print('MedicPlaceAction:: Success::', this.a.name, 'placedin:', this.a.currRoom, this.a.currStation, '||| from:',   this.a.exitRoom ) //testjpf
  }
}
