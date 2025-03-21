import { ActionProps, MedicPlaceProps } from '../../../types/behaviors'
import { RoomsInitState } from '../../states/inits/roomsInitState'
import Action from '../action'

export default class MedicPlaceAction extends Action {
  a: MedicPlaceProps
  constructor(props: ActionProps) {
    super()
    this.a = props as MedicPlaceProps
  }
  run(): { (): void } {
    const mobile = this.a.turnPriority < 96
    const infirmed = this.a.getWards('infirmary').length

    if (this.a.cooldown > 0) this.a.cooldown = this.a.cooldown - 1
    this.a.exitRoom = this.a.currRoom

    if (mobile === true && infirmed > 1) {
      if (math.random() + infirmed * 0.2 > 1) {
        const filled = this.a.checkSetStation('infirmary', 'aid', this.a.name)
        print('||>> Behavior: MedicPlaceAction: TendingShop!', this.a.name)

        if (filled == true) {
          this.a.currRoom = 'infirmary'
          return () => this.success()
        }
        //testjpf instead parent.checkSetStation()
        //would have to redo conditional logic.
        //!! I think this logic is badd anyway
        //this has no ELSE!!!
        //!!! RELY on () => success()  INSTEAD
      } else if (infirmed > 2) {
        const target = RoomsInitState.infirmary.matrix
        this.a.findRoomPlaceStation(target)
        print('||>> Behavior: MedicPlaceAction: CodeBlue!', this.a.name)
        return () => this.success()
      }
    } else if (
      mobile === true &&
      infirmed < 1 &&
      this.a.getMendingQueue().length > 1
    ) {
      const target = RoomsInitState[this.a.returnMendeeLocation()!].matrix

      this.a.findRoomPlaceStation(target)
      print('||>> Behavior: MedicPlaceAction: Paramedic!', this.a.name)
      return () => this.success()
    }

    this.a.findRoomPlaceStation()

    return () => this.success()
  }
  success() {
    // prettier-ignore
   //if (print('MedicPlaceAction:: Success::', this.a.name, 'placedin:', this.a.currRoom, this.a.currStation, '||| from:',   this.a.exitRoom )
  }
}
