import { ActionProps, MedicPlaceProps } from '../../../types/behaviors'
import { RoomsInitState } from '../../states/inits/roomsInitState'
//import { isNpc } from '../../utils/ai'
import Action from '../action'

export default class MedicPlaceAction extends Action {
  a: MedicPlaceProps
  constructor(props: ActionProps) {
    super(props)
    this.a = props as MedicPlaceProps
  }
  run(): { (): void } {
    const mobile = this.a.turnPriority < 90
    const infirmed = this.a.getWards('infirmary').length

    if (this.a.cooldown > 0) this.a.cooldown = this.a.cooldown - 1
    this.a.exitRoom = this.a.currRoom

    if (mobile === true && infirmed > 1) {
      if (math.random() + infirmed * 0.2 > 1) {
        const filled = this.a.checkSetStation('infirmary', 'aid', this.a.name)
        print('ERfull 1st', this.a.name)
        if (filled == true) {
          this.a.currRoom = 'infirmary'
          return () => this.success()
        }
        //testjpf instead parent.checkSetStation()
        //would have to redo conditional logic.
        //!! I think this logic is badd anyway
        //this has no ELSE!!!
        //!!! RELY on () => success()  INSTEAD
        //   this.a.parent.pruneStationMap('infirmary', 'aid')
      } else if (infirmed > 2) {
        const target = RoomsInitState.infirmary.matrix
        print('findRoomPlaceStation MEDICPLACEACTION', this.a.name)
        this.a.findRoomPlaceStation(target)
        //  rooms = this.a.makePriorityRoomList(target)
        print('ERfull help')
        return () => this.success()
      }
    } else if (
      mobile === true &&
      infirmed < 1 &&
      this.a.getMendingQueue().length > 1
    ) {
      const target = RoomsInitState[this.a.returnMendeeLocation()!].matrix
      print('findRoomPlaceStation MEDICPLACEACTION2', this.a.name)

      this.a.findRoomPlaceStation(target)
      //rooms = this.a.makePriorityRoomList(target)
      print('Paramedic!', this.a.name)
      return () => this.success()
    }
    print('findRoomPlaceStation MEDICPLACEACTION3', this.a.name)

    this.a.findRoomPlaceStation()

    // this.a.findRoomPlaceStation(target)
    return () => this.success()
  }
  success() {
    // prettier-ignore
   //if (print('MedicPlaceAction:: Success::', this.a.name, 'placedin:', this.a.currRoom, this.a.currStation, '||| from:',   this.a.exitRoom )
  }
}
