import { HelperProps } from '../../../types/behaviors'
import { RoomsInitState } from '../../states/inits/roomsInitState'
import Action from '../action'

export default class ScoutAction extends Action {
  a: HelperProps
  room: string
  constructor(props: HelperProps, room: string) {
    super()
    this.a = props
    this.room = room
  }

  run(): { (): void } {
    if (this.a.cooldown > 0) this.a.cooldown = this.a.cooldown - 1
    this.a.exitRoom = this.a.currRoom

    const victimMatirix: { x: number; y: number } =
      RoomsInitState[this.room].matrix
    const target = { x: 0, y: 0 }

    if (victimMatirix.x < 3 && this.a.matrix.x != 4) target.x = 4
    if (victimMatirix.y < 3 && this.a.matrix.y != 5) target.y = 5
    const rooms = this.a.makePriorityRoomList(target)
    // prettier-ignore
    //for (const r of rooms) { print('SCOUTACTIO::: makePriorityRoomList:: THISISR:',r,'is it empty?:',r == ''  ) }
    rooms.splice(rooms.indexOf(this.room), 1)

    this.a.findRoomPlaceStation({ x: 9, y: 9 }, [...rooms])

    return () => this.success()
  }
  success() {
    print(
      '||>> Behavior: scoutAction: Succuess: findRoomPlaceStation:',
      this.a.name,
      this.room,
    )
    // if (isNpc(this.a))
    // prettier-ignore
    //print('PlaceAction:: Success::', this.a.name, 'placedin:', this.a.currRoom, this.a.currStation, '||| from:',   this.a.exitRoom ) //testjpf
  }
}
