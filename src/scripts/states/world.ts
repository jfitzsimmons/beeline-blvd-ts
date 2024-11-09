/* eslint-disable @typescript-eslint/no-empty-function */

import StateMachine from './stateMachine'
import WorldRooms from './rooms'
import WorldPlayer from './player'
import WorldNpcs from './npcs'
import WorldTasks from './tasks'
import WorldInfo from './info'
import WorldNovel from './novel'
import WorldQuests from './quests'
import {
  AllQuestsMethods,
  NpcsProps,
  WorldNovelProps,
  WorldPlayerProps,
  WorldTasksProps,
} from '../../types/tasks'
import NpcState from './npc'

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
  constructor() {
    this.fsm = new StateMachine(this, 'world')
    this.rooms = new WorldRooms()
    const novelProps: WorldNovelProps = {
      returnNpc: this.returnNpc.bind(this),
    }
    this.novel = new WorldNovel(novelProps)
    const tasksProps: WorldTasksProps = {
      didCrossPaths: this.didCrossPaths.bind(this),
      returnPlayer: this.returnPlayer.bind(this),
      getOccupants: this.rooms.getOccupants.bind(this),
      setConfrontation: this.novel.setConfrontation.bind(this),
      ...novelProps,
    }
    this.tasks = new WorldTasks(tasksProps)
    const playerProps: WorldPlayerProps = {
      getFocusedRoom: this.rooms.get_focused.bind(this),
      hasHallpass: this.tasks.has_clearance.bind(this),
      removeTaskByCause: this.tasks.removeTaskByCause.bind(this),
    }
    this.player = new WorldPlayer(playerProps)
    const npcsProps: NpcsProps = {
      isStationedTogether: this.rooms.isStationedTogether.bind(this),
      clearStation: this.rooms.clearStation.bind(this),
      setStation: this.rooms.setStation.bind(this),
      pruneStationMap: this.rooms.pruneStationMap.bind(this),
      getStationMap: this.rooms.getStationMap.bind(this),
      sendToVacancy: this.rooms.sendToVacancy.bind(this),
      getPlayerRoom: this.player.getPlayerRoom.bind(this),
      getMendingQueue: this.tasks.getMendingQueue.bind(this),
      taskBuilder: this.tasks.taskBuilder.bind(this),
      getNovelUpdates: this.novel.getNovelUpdates.bind(this),
      ...playerProps,
    }
    this.npcs = new WorldNpcs(npcsProps)

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
     * testjpf you could importchecks
     * have something like this.checks?
     * maybe pass it npc stats??
     * could even be a clasS?? new
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

  private onNewEnter(): void {
    this.rooms.fsm.setState('turn')
    this.player.fsm.setState('turn')
    this.player.exitRoom = 'grounds'
    this.npcs.fsm.setState('new')
    this.tasks.fsm.setState('turn')
    this.quests.fsm.setState('turn')
    //debug defaults
    this.npcs.all[this.rooms.all.reception.stations.guest].hp = 0
    this.npcs.all[this.rooms.all.reception.stations.guest].fsm.setState(
      'injury'
    )
    this.tasks.taskBuilder(
      'security004',
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
    this.player.fsm.setState('turn')
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
    this.clock = this.clock + 1
    if (this.clock > 23) this.clock = this.clock - 24
  }
  private onTurnUpdate(): void {
    this.player.fsm.update(dt)
    this.npcs.fsm.update(dt)
    this.rooms.fsm.update(dt)
    this.quests.fsm.update(dt)
    this.tasks.fsm.update(dt)
  }
  private onTurnExit(): void {}
  private didCrossPaths(o: string, t: string): boolean {
    const owner = this.npcs.all[o]
    const target = this.npcs.all[t]
    print(
      'didcross:::',
      owner.name,
      target.name,
      owner.currRoom == target.currRoom,
      owner.currRoom == target.exitRoom,
      owner.exitRoom == target.currRoom
    )
    return (
      owner.currRoom == target.currRoom ||
      (owner.currRoom == target.exitRoom && owner.exitRoom == target.currRoom)
    )
  }
  private returnNpc(n: string): NpcState {
    // testjpf probably needs to be this.npcs.returnNpc(n)
    return this.npcs.all[n]
  }
  private returnPlayer(): WorldPlayer {
    // testjpf probably needs to be this.npcs.returnNpc(n)
    return this.player
  }
}
