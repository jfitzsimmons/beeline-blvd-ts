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
  private stateMachine: StateMachine
  player: WorldPlayer
  npcs: WorldNpcs
  rooms: WorldRooms
  tasks: WorldTasks
  info: WorldInfo
  novel: WorldNovel
  clock: number

  constructor() {
    this.stateMachine = new StateMachine(this, 'world')
    this.player = new WorldPlayer()
    this.npcs = new WorldNpcs()
    this.rooms = new WorldRooms()
    const params: AllQuestsMethods = {
      pq: this.player.quests,
      nq: this.npcs.quests,
    }
    this.tasks = new WorldTasks(params)
    this.info = new WorldInfo(this.tasks.quests)
    this.novel = new WorldNovel(
      this.npcs.all.labor01,
      this.tasks.quests.tutorial.medic_assist.conditions[1]
    )
    this.clock = 6
    this.stateMachine
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

    this.stateMachine.setState('idle')
  }

  update(dt: number) {
    this.stateMachine.update(dt)
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
