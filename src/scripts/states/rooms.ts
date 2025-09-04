/* eslint-disable @typescript-eslint/no-empty-function */
import RoomState from './room'
import StateMachine from './stateMachine'
import { Room, Rooms } from '../../types/state'
import { RoomProps, WorldArgs } from '../../types/world'
import { RoomsInitState } from './inits/roomsInitState'

const dt = math.randomseed(os.time())

export default class WorldRooms {
  fsm: StateMachine
  private _all: Rooms
  //ayout: Array<Array<string | null>>
  // roles: Roles
  private _focused: string
  world: RoomProps
  //fallbacks: Fallbacks

  constructor(roomsProps: WorldArgs) {
    this.fsm = new StateMachine(this, 'rooms')
    //this.fallbacks = { ...RoomsInitFallbacks }
    // this.layout = [...RoomsInitLayout]
    //this.roles = { ...RoomsInitRoles }
    this.world = {
      setFocused: this.setFocused.bind(this),
      ...roomsProps,
    }

    this._all = { ex: new RoomState({ ...RoomsInitState.roomexample }) }
    this._focused = 'grounds'

    this.fsm
      .addState('idle')
      .addState('turn', {
        onEnter: this.onTurnEnter.bind(this),
        onUpdate: this.onTurnUpdate.bind(this),
        onExit: this.onTurnExit.bind(this),
      })
      .addState('new', {
        onEnter: this.onNewEnter.bind(this),
        onUpdate: this.onNewUpdate.bind(this),
        onExit: this.onNewExit.bind(this),
      })

    this.setFocused = this.setFocused.bind(this)
    this.get_focused = this.get_focused.bind(this)
  }
  public get all(): Rooms {
    return this._all
  }
  public get focused(): string {
    return this._focused
  }
  public set focused(f: string) {
    this._focused = f
  }

  setFocused(r: string) {
    this.focused = r
  }
  get_focused(): string {
    return this.focused
  }

  private onTurnEnter(): void {
    //this.resetStationMap()
  }
  private onTurnUpdate(): void {
    //  this.resetStationMap()
    //testjpf. this runs the level ai checks for focused room.
    //this will probably be task/quest related.
    //meaning room sys needs quest/task props.
    //inquestinitdata probably need folder that can also include roomtask/upgrade tasks
    //import all files from folder into quests sys and initialize
    //need conditional to add id to roomState?
    let kr: keyof typeof this._all
    for (kr in this._all) this._all[kr].fsm.update(dt)
  }
  private onTurnExit(): void {}
  private onNewEnter(): void {}
  private onNewUpdate(): void {}
  private onNewExit(): void {}
  initRoom(room: Room) {
    this._all = {}
    this._all[room.name] = new RoomState(room)
  }
  initStation(room: string, id: string) {
    this._all[room].stationKeys.push(id)
  }
}
