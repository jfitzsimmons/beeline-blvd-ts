/* eslint-disable @typescript-eslint/no-empty-function */

import StateMachine from './stateMachine'
import WorldRooms from './rooms'
import WorldPlayer from './player'
import WorldNpcs from './npcs'
import WorldTasks from './tasks'
import WorldInfo from './info'
import WorldNovel from './novel'
import { AllQuestsMethods, RoomMethod } from '../../types/tasks'
import { surrounding_room_matrix } from '../utils/utils'

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

  constructor() {
    this.fsm = new StateMachine(this, 'world')
    this.player = new WorldPlayer()
    this.rooms = new WorldRooms()

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
      .addState('start', {
        //game??
        //onInit?
        onEnter: this.onGameStart.bind(this),
        onUpdate: this.onGameUpdate.bind(this),
        onExit: this.onGameEnd.bind(this),
      })
      .addState('player', {
        //onInit?
        onUpdate: this.onPlayerUpdate.bind(this),
      })
      .addState('room', {
        onEnter: this.onRoomEnter.bind(this),
        onUpdate: this.onRoomUpdate.bind(this),
        onExit: this.onRoomExit.bind(this),
      })
      .addState('npcs', {
        onEnter: this.onNpcEnter.bind(this),
        onUpdate: this.onNpcUpdate.bind(this),
        onExit: this.onNpcExit.bind(this),
      })
      .addState('tasks', {
        onEnter: this.onTaskAdd.bind(this),
        onUpdate: this.onTaskUpdate.bind(this),
        onExit: this.onTaskDelete.bind(this),
      })

    this.fsm.setState('idle')
  }

  update(dt: number) {
    this.fsm.update(dt)
  }

  // so what next. start with world.init in lua file
  private onGameStart(): void {}
  private onGameUpdate(): void {}
  private onGameEnd(): void {}
  private onRoomEnter(): void {
    this.rooms.fsm.setState('turn')
    this.npcs.vicinityTargets = surrounding_room_matrix(
      this.rooms.all[this.player.exitroom].matrix,
      this.player.matrix
    )
    this.npcs.fsm.setState('turn')
    //this is where you'd have npc, room, functions
    //prob rooms.update() npcs.update()
    //tasks too???ntestjpf
  }
  private onRoomUpdate(): void {
    this.rooms.fsm.update(dt)
    this.npcs.fsm.update(dt)
  }
  private onRoomExit(): void {}
  private onNpcEnter(): void {}
  private onNpcUpdate(): void {}
  private onNpcExit(): void {}
  private onTaskAdd(): void {}
  private onTaskUpdate(): void {}
  private onTaskDelete(): void {}
  private onPlayerUpdate(): void {}

  // ...
}
