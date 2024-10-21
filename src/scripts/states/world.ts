/* eslint-disable @typescript-eslint/no-empty-function */

import StateMachine from './stateMachine'
import WorldRooms from './rooms'
import WorldPlayer from './player'
import WorldNpcs from './npcs'
import WorldTasks from './tasks'
import WorldInfo from './info'
import WorldNovel from './novel'
import { AllQuestsMethods } from '../../types/tasks'

export default class World {
  private fsm: StateMachine
  player: WorldPlayer
  npcs: WorldNpcs
  rooms: WorldRooms
  tasks: WorldTasks
  info: WorldInfo
  novel: WorldNovel
  clock: number
  clear_station: (room: string, station: string) => void

  constructor() {
    this.fsm = new StateMachine(this, 'world')
    this.player = new WorldPlayer()
    this.rooms = new WorldRooms()
    this.clear_station = this.rooms.clear_station.bind(this)

    const roommethods: {
      [key: string]: (room: string, station: string) => void
    } = {
      clear_station: this.clear_station,
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
      .addState('world', {
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
      .addState('testjpfrooms', {
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
  private onRoomEnter(): void {}
  private onRoomUpdate(): void {}
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
