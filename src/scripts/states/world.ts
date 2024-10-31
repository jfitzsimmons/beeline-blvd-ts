/* eslint-disable @typescript-eslint/no-empty-function */

import StateMachine from './stateMachine'
import WorldRooms from './rooms'
import WorldPlayer from './player'
import WorldNpcs from './npcs'
import WorldTasks from './tasks'
import WorldInfo from './info'
import WorldNovel from './novel'
import { AllQuestsMethods, RoomMethod, TasksMethods } from '../../types/tasks'
import { surrounding_room_matrix } from '../utils/utils'
import { RoomsInitState } from './inits/roomsInitState'
import { Direction } from '../../types/ai'
import WorldQuests from './quests'
//import { surrounding_room_matrix } from '../utils/utils'

const dt = math.randomseed(os.time())

export default class World {
  fsm: StateMachine
  player: WorldPlayer
  npcs: WorldNpcs
  rooms: WorldRooms
  tasks: WorldTasks
  quests: WorldQuests
  info: WorldInfo
  novel: WorldNovel
  clock: number
  loadType: string
  constructor() {
    this.fsm = new StateMachine(this, 'world')
    //testjpf could proabbly give rooms to player instead of the opposite
    //now give focusedRoom and inSameRoom to tasks and player
    this.rooms = new WorldRooms()
    this.tasks = new WorldTasks()
    const tasksMethods: TasksMethods = {
      has_hallpass: this.tasks.has_clearance.bind(this),
      removeTaskByCause: this.tasks.removeTaskByLabel.bind(this),
    }

    this.player = new WorldPlayer(tasksMethods)
    // const playerMethods = {
    // set_room_info: this.player.set_room_info.bind(this),
    //  get_player_room: this.player.get_player_room.bind(this),
    //}

    this.loadType = 'new game'
    const roommethods: RoomMethod = {
      clear_station: this.rooms.clear_station.bind(this),
      set_station: this.rooms.set_station.bind(this),
      prune_station_map: this.rooms.prune_station_map.bind(this),
      get_station_map: this.rooms.get_station_map.bind(this),
      reset_station_map: this.rooms.reset_station_map.bind(this),
      send_to_infirmary: this.rooms.send_to_infirmary.bind(this),
      get_player_room: this.player.get_player_room.bind(this),
      getVicinityTargets: this.getVicinityTargets.bind(this),
      getMendingQueue: this.tasks.getMendingQueue.bind(this),
      taskBuilder: this.tasks.task_builder.bind(this),
      ...tasksMethods,
    }
    this.npcs = new WorldNpcs(roommethods)
    this.novel = new WorldNovel(this.npcs.all.labor01)

    const allquestmethods: AllQuestsMethods = {
      pq: this.player.quests,
      nq: this.npcs.quests,
      nvq: this.novel.quests,
      tq: this.tasks.quests,
    }
    this.quests = new WorldQuests(allquestmethods)
    this.info = new WorldInfo(this.quests.all)

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
      .addState('turn', {
        onEnter: this.onTurnEnter.bind(this),
        onUpdate: this.onTurnUpdate.bind(this),
        onExit: this.onTurnExit.bind(this),
      })
  }

  // so what next. start with world.init in lua file
  private onNewEnter(): void {
    this.player.fsm.setState('turn')
    this.rooms.fsm.setState('turn')
    this.rooms.all.grounds.fsm.setState('focus')
    this.player.currentroom = 'grounds'
    this.npcs.fsm.setState('new')

    // this.npcs.fsm.update(dt)
    this.quests.fsm.setState('turn')
    //debug defaults
    this.npcs.all[this.rooms.all.reception.stations.guest].hp = 0
    this.npcs.all[this.rooms.all.reception.stations.guest].fsm.setState(
      'injury'
    )
    this.tasks.task_builder(
      this.npcs.all['security004'],
      'questioning',
      this.rooms.all.grounds.stations.assistant,
      'testing'
    )
    //quest
    this.npcs.all[this.rooms.all.grounds.stations.worker1].hp = 0
    this.npcs.all[this.rooms.all.grounds.stations.worker1].fsm.setState(
      'injury'
    )
    this.npcs.add_ignore(this.rooms.all.grounds.stations.worker1)
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
  private onTurnEnter(): void {
    print('WORLD TURN ENTER')
    this.clock = this.clock + 1
    if (this.clock > 23) {
      this.clock = this.clock - 24
    }
  }
  private onTurnUpdate(): void {
    print('WORLD TURNUPDATE')
    this.player.fsm.update(dt)
    this.npcs.fsm.update(dt)
    this.rooms.fsm.update(dt)
    this.quests.fsm.update(dt)
  }
  private onTurnExit(): void {}
  private onPlayerUpdate(): void {}

  private getVicinityTargets(): Direction {
    return surrounding_room_matrix(
      RoomsInitState[this.player.exitroom].matrix,
      this.player.matrix
    )
    //return this._vicinityTargets
  }
}
