import { ActionProps, CopPlaceProps } from '../../../types/behaviors'
import {
  RoomsInitPriority,
  RoomsInitState,
} from '../../states/inits/roomsInitState'
import Action from '../action'

export default class CopPlaceAction extends Action {
  a: CopPlaceProps
  constructor(props: ActionProps) {
    super()
    this.a = props as CopPlaceProps
  }
  run(): { (): void } {
    const mobile = this.a.turnPriority < 96
    const inprisoned = this.a.getWards('security').length

    if (this.a.cooldown > 0) this.a.cooldown = this.a.cooldown - 1
    this.a.exitRoom = this.a.currRoom

    if (mobile === true && inprisoned > 1) {
      if (math.random() + inprisoned * 0.2 > 1) {
        const filled = this.a.checkSetStation('security', 'desk', this.a.name)
        print('||>> Behavior: CopPlaceAction: TendingShop!', this.a.name)

        if (filled == true) {
          this.a.currRoom = 'security'
          return () => this.success()
        }
        //testjpf instead parent.checkSetStation()
        //would have to redo conditional logic.
        //!! I think this logic is badd anyway
        //this has no ELSE!!!
        //!!! RELY on () => success()  INSTEAD
      } else if (inprisoned > 2) {
        const target = RoomsInitState.security.matrix
        this.a.findRoomPlaceStation(target)
        print('||>> Behavior: CopPlaceAction: CodeBlue!', this.a.name)
        return () => this.success()
      }
    } else if (
      mobile === true &&
      inprisoned < 1 &&
      this.a.getWantedQueue().length > 1
    ) {
      const [criminal, crimeScene] = this.a.getWantedQueue()[0]
      const target =
        crimeScene != 'checked'
          ? RoomsInitState[crimeScene].matrix
          : RoomsInitState[
              RoomsInitPriority[math.random(0, RoomsInitPriority.length)]
            ].matrix

      this.a.findRoomPlaceStation(target)
      if (
        crimeScene != 'checked' &&
        (this.a.getBehaviorProps('cops') as CopPlaceProps).currRoom ==
          crimeScene
      )
        this.a.addAdjustWantedQueue(criminal, 'checked')
      print('||>> Behavior: CopPlaceAction: Bounty HUuting!', this.a.name)

      return () => this.success()
    }
    print('||>> Behavior: CopPlaceAction: Default Placing.', this.a.name)
    this.a.findRoomPlaceStation()

    return () => this.success()
  }
  success() {
    // prettier-ignore
   //if (print('CopPlaceAction:: Success::', this.a.name, 'placedin:', this.a.currRoom, this.a.currStation, '||| from:',   this.a.exitRoom )
  }
}
