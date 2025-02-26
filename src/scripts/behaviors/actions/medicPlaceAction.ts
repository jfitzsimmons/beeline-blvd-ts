import { ActionProps, MedicPlaceProps } from '../../../types/behaviors'
import {
  RoomsInitLayout,
  RoomsInitState,
} from '../../states/inits/roomsInitState'
//import { isNpc } from '../../utils/ai'
import Action from '../action'

export default class MedicPlaceAction extends Action {
  //TESTJPF MAYBE use DocPlaceProps
  a: MedicPlaceProps
  constructor(props: ActionProps) {
    /**testjpf
     * do something like
     * constructor(getProps: () => ActionProps)
     */
    // const props = getProps('medplace') as MedicPlaceProps
    super(props)
    this.a = props as MedicPlaceProps
  }

  run(): { (): void } {
    //TESTJPF NEED a bulletin board
    // if (!isNpc(this.a)) return () => this.fail('MedicPlaceAction::: not npc')
    const mobile = this.a.sincePlayerRoom < 90
    const infirmed = this.a.getInfirmed().length

    if (this.a.cooldown > 0) this.a.cooldown = this.a.cooldown - 1
    this.a.exitRoom = RoomsInitLayout[this.a.matrix.y][this.a.matrix.x]!

    if (mobile === true && infirmed > 1) {
      //const patients = this.a.parent.getInfirmed()
      if (
        math.random() + infirmed * 0.2 >
        1 //&&
        //  this.a.parent.getStationMap().infirmary.aid !== undefined
      ) {
        const filled = this.a.checkSetStation('infirmary', 'aid', this.a.name)
        if (filled == true) return () => this.success()
        //testjpf instead parent.checkSetStation()
        //would have to redo conditional logic.
        //!! I think this logic is badd anyway
        //this has no ELSE!!!
        //!!! RELY on () => success()  INSTEAD
        //   this.a.parent.pruneStationMap('infirmary', 'aid')
        print('ERfull 1st')
      } else if (infirmed > 2) {
        const target = RoomsInitState.infirmary.matrix
        print('findRoomPlaceStation MEDICPLACEACTION')
        this.a.findRoomPlaceStation(target)
        //  rooms = this.a.makePriorityRoomList(target)
        print('ERfull help')
      }
    } else if (
      mobile === true &&
      infirmed < 1 &&
      this.a.getMendingQueue().length > 1
    ) {
      const target = RoomsInitState[this.a.returnMendeeLocation()!].matrix
      print('findRoomPlaceStation MEDICPLACEACTION2')

      this.a.findRoomPlaceStation(target)
      //rooms = this.a.makePriorityRoomList(target)
      print('Paramedic!')
      return () => this.success()
    }
    print('findRoomPlaceStation MEDICPLACEACTION3')

    this.a.findRoomPlaceStation()

    // this.a.findRoomPlaceStation(target)
    return () => this.success()
  }
  success() {
    // prettier-ignore
   //if (print('MedicPlaceAction:: Success::', this.a.name, 'placedin:', this.a.currRoom, this.a.currStation, '||| from:',   this.a.exitRoom )
  }
}
