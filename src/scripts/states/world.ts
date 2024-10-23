/* eslint-disable @typescript-eslint/no-empty-function */

import StateMachine from './stateMachine'
import WorldRooms from './rooms'
import WorldPlayer from './player'
import WorldNpcs from './npcs'
import WorldTasks from './tasks'
import WorldInfo from './info'
import WorldNovel from './novel'
import { AllQuestsMethods, RoomMethod } from '../../types/tasks'
//import { surrounding_room_matrix } from '../utils/utils'

const dt = math.randomseed(os.time())

export default class World {
  fsm: StateMachine
  player: WorldPlayer
  npcs: WorldNpcs
  rooms: WorldRooms
  tasks: WorldTasks
  info: WorldInfo
  novel: WorldNovel
  clock: number
  loadType: string
  constructor() {
    this.fsm = new StateMachine(this, 'world')
    this.player = new WorldPlayer()
    this.rooms = new WorldRooms()
    this.loadType = 'new game'
    const roommethods: RoomMethod = {
      clear_station: this.rooms.clear_station.bind(this),
      set_station: this.rooms.set_station.bind(this),
      prune_station_map: this.rooms.prune_station_map.bind(this),
      get_station_map: this.rooms.get_station_map.bind(this),
      reset_station_map: this.rooms.reset_station_map.bind(this),
      get_player_room: this.player.get_player_room.bind(this),
    }
    this.npcs = new WorldNpcs(roommethods)
    this.novel = new WorldNovel(this.npcs.all.labor01)
    const allquestmethods: AllQuestsMethods = {
      pq: this.player.quests,
      nq: this.npcs.quests,
      nvq: this.novel.quests,
    }
    this.tasks = new WorldTasks(allquestmethods)
    this.info = new WorldInfo(this.tasks.quests)

    this.clock = 6
    /**
     * so in world/worldcontroller room transition would be a state
     * menu, save, load
     * - sub states like arrested, enterdoor, faint
     */
    this.fsm
      .addState('idle')
      .addState('new', {
        //game??
        //onInit?
        onEnter: this.onNewEnter.bind(this),
        onUpdate: this.onNewUpdate.bind(this),
        onExit: this.onNewExit.bind(this),
      })
      .addState('player', {
        //onInit?
        onUpdate: this.onPlayerUpdate.bind(this),
      })
      .addState('faint', {
        onEnter: this.onFaintEnter.bind(this),
        onUpdate: this.onFaintUpdate.bind(this),
        onExit: this.onFaintExit.bind(this),
      })
      .addState('arrest', {
        onEnter: this.onArrestEnter.bind(this),
        onUpdate: this.onArrestUpdate.bind(this),
        onExit: this.onArrestExit.bind(this),
      })
      .addState('room', {
        onEnter: this.onRoomEnter.bind(this),
        onUpdate: this.onRoomUpdate.bind(this),
        onExit: this.onRoomExit.bind(this),
      })

    this.fsm.setState('idle')
  }
  //testjpf this is why fsm was set to private
  update(dt: number) {
    this.fsm.update(dt)
  }

  // so what next. start with world.init in lua file
  private onNewEnter(): void {
    this.npcs.fsm.setState('new')
    this.player.currentroom = 'grounds'
  }
  private onNewUpdate(): void {}
  private onNewExit(): void {}
  private onFaintEnter(): void {
    this.clock = this.clock + 6
    this.player.ap = this.player.ap_max - 6
    this.player.hp = this.player.hp_max - 1
  }
  private onFaintUpdate(): void {}
  private onFaintExit(): void {}
  private onArrestEnter(): void {
    this.clock = this.clock + 6
    this.player.alert_level = 0
    this.player.ap = this.player.ap_max - 6
  }
  private onArrestUpdate(): void {}
  private onArrestExit(): void {}
  private onRoomEnter(): void {
    this.clock = this.clock + 1
    if (this.clock > 23) {
      this.clock = this.clock - 24
    }
  }
  private onRoomUpdate(): void {
    this.npcs.fsm.update(dt)
  }
  private onRoomExit(): void {}
  private onPlayerUpdate(): void {}

  // ...
}
