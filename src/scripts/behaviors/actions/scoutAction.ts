import { HelperProps } from '../../../types/behaviors'
import { RoomsInitState } from '../../states/inits/roomsInitState'
import Action from '../action'

export default class ScoutAction extends Action {
  a: HelperProps
  room: string
  constructor(props: HelperProps, room: string) {
    super(props)
    this.a = props
    this.room = room
  }

  run(): { (): void } {
    if (this.a.cooldown > 0) this.a.cooldown = this.a.cooldown - 1
    this.a.exitRoom = this.a.currRoom

    const victimMatirix: { x: number; y: number } =
      RoomsInitState[this.room].matrix
    const target = { x: 0, y: 1 }

    if (victimMatirix.x < 3) target.x = 4
    if (victimMatirix.y < 3) target.y = 5
    const rooms = this.a.makePriorityRoomList(target)
    for (const r of rooms) {
      print(
        'SCOUTACTIO::: makePriorityRoomList:: THISISR:',
        r,
        'is it empty?:',
        r == ''
      )
    }
    const index = rooms.indexOf(this.room)

    if (index !== -1) {
      rooms.splice(index, 1)
    }
    print(
      'findRoomPlaceStation scoutACTION:',
      this.a.name,
      this.room,
      rooms.includes(this.room)
    )
    this.a.findRoomPlaceStation({ x: 9, y: 9 }, [...rooms])

    return () => this.success()
  }
  success() {
    // if (isNpc(this.a))
    // prettier-ignore
    //print('PlaceAction:: Success::', this.a.name, 'placedin:', this.a.currRoom, this.a.currStation, '||| from:',   this.a.exitRoom ) //testjpf
  }
}
