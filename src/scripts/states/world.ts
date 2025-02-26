/* eslint-disable @typescript-eslint/no-empty-function */

import StateMachine from './stateMachine'
import WorldRooms from './rooms'
import WorldPlayer from './player'
import WorldNpcs from './npcs'
import WorldTasks from './tasks'
import WorldInfo from './info'
import WorldNovel from './novel'
import WorldQuests from './quests'
import NpcState from './npc'
import {
  WorldNpcsArgs,
  WorldPlayerArgs,
  WorldTasksArgs,
  WorldQuestsMethods,
  WorldArgs,
} from '../../types/world'

const dt = math.randomseed(os.time())

export default class World {
  fsm: StateMachine
  rooms: WorldRooms
  novel: WorldNovel
  tasks: WorldTasks
  player: WorldPlayer
  npcs: WorldNpcs
  quests: WorldQuests
  info: WorldInfo
  clock: number
  constructor() {
    this.fsm = new StateMachine(this, 'world')
    const roomsProps: WorldArgs = {
      returnNpc: this.returnNpc.bind(this),
      returnPlayer: this.returnPlayer.bind(this),
    }
    this.rooms = new WorldRooms(roomsProps)
    const novelProps: WorldArgs = {
      ...roomsProps,
    }
    this.novel = new WorldNovel(novelProps)
    const tasksProps: WorldTasksArgs = {
      didCrossPaths: this.didCrossPaths.bind(this),
      getOccupants: this.rooms.getOccupants.bind(this),
      setConfrontation: this.novel.setConfrontation.bind(this),
      ...novelProps,
    }
    this.tasks = new WorldTasks(tasksProps)
    const playerProps: WorldPlayerArgs = {
      getFocusedRoom: this.rooms.get_focused.bind(this),
      hasHallpass: this.tasks.has_clearance.bind(this),
      removeTaskByCause: this.tasks.removeTaskByCause.bind(this),
    }
    this.player = new WorldPlayer('hero', playerProps)
    const npcsProps: WorldNpcsArgs = {
      isStationedTogether: this.rooms.isStationedTogether.bind(this),
      clearStation: this.rooms.clearStation.bind(this),
      setStation: this.rooms.setStation.bind(this),
      pruneStationMap: this.rooms.pruneStationMap.bind(this),
      getStationMap: this.rooms.getStationMap.bind(this),
      sendToVacancy: this.rooms.sendToVacancy.bind(this),
      getPlayerRoom: this.player.getPlayerRoom.bind(this),
      getMendingQueue: this.tasks.getMendingQueue.bind(this),
      removeMendee: this.tasks.removeMendee.bind(this),
      taskBuilder: this.tasks.taskBuilder.bind(this),
      npcHasTask: this.tasks.npcHasTask.bind(this),
      addAdjustMendingQueue: this.tasks.addAdjustMendingQueue.bind(this),
      getNovelUpdates: this.novel.getNovelUpdates.bind(this),
      playerFSM: this.player.fsm,
      playerTraits: this.player.traits,
      ...playerProps,
      ...tasksProps,
      getNpcByRoomStation: this.rooms.getNpcByRoomStation.bind(this),
    }
    this.npcs = new WorldNpcs(npcsProps)
    const allquestmethods: WorldQuestsMethods = {
      pq: this.player.quests,
      nq: this.npcs.quests,
      nvq: this.novel.quests,
      tq: this.tasks.quests,
    }
    this.quests = new WorldQuests(allquestmethods)
    this.info = new WorldInfo(this.quests.all)
    this.clock = 6
    this.fsm
      .addState('idle')
      .addState('new', {
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
    this.npcs.fsm.setState('new') //Adds a PlaceSeq and runs it //also test defaults
    this.tasks.fsm.setState('turn')
    this.quests.fsm.setState('new')

    //debug defaults
    this.tasks.taskBuilder(
      'security004',
      'questioning',
      this.rooms.all.grounds.stations.guest === ''
        ? this.rooms.all.grounds.swaps.guest[1]
        : this.rooms.all.grounds.stations.guest,
      'testing'
    )
    this.npcs.addIgnore(this.rooms.all.grounds.stations.worker1)
  }
  private onNewUpdate(): void {}

  private onFaintEnter(): void {
    this.clock = this.clock + 6
    this.player.ap = this.player.apMax - 6
    this.player.hp = this.player.hpMax - 1
  }
  private onFaintUpdate(): void {
    this.player.fsm.update(dt)
    this.rooms.fsm.update(dt)
    this.npcs.fsm.update(dt)
    this.quests.fsm.update(dt)
    this.tasks.fsm.update(dt)
    this.fsm.setState('turn')
  }
  private onFaintExit(): void {}
  private onArrestEnter(): void {
    this.clock = this.clock + 6
    this.player.alert_level = 0
    this.player.ap = this.player.apMax - 6
  }
  private onArrestUpdate(): void {
    this.player.fsm.update(dt)
    this.rooms.fsm.update(dt)
    this.npcs.fsm.update(dt)
    this.quests.fsm.update(dt)
    this.tasks.fsm.update(dt)
    this.fsm.setState('turn')
  }
  private onArrestExit(): void {}
  private onNewExit(): void {
    //testjpf i think this should be 'active'
    //the room transtition sets it to turn
    print('WORLDNEWEXIT()!!! set npc-S ACTIVE')
    this.npcs.fsm.setState('active') //each npc gets set to 'active' which runs active behavior from newExit
  }
  private onTurnEnter(): void {
    print('<<< ::: AI TURN HAS ENDED ::: >>>')
  }
  private onTurnUpdate(): void {
    print('<<< ::: WORLDTurnUpdate() ::: >>>')
    this.npcs.fsm.setState('place')
    this.clock = this.clock + 1
    if (this.clock > 23) this.clock = this.clock - 24
    this.player.fsm.update(dt)
    this.rooms.fsm.update(dt)
    this.npcs.fsm.update(dt)
    this.quests.fsm.update(dt)
    this.tasks.fsm.update(dt)
    this.npcs.fsm.setState('active')
  }
  private onTurnExit(): void {}
  private didCrossPaths(o: string, t: string): boolean {
    const owner = this.npcs.all[o]
    const target = this.npcs.all[t]
    // prettier-ignore
    // print('didcross:::', owner.name, target.name, owner.currRoom == target.currRoom, owner.currRoom == target.exitRoom, owner.exitRoom == target.currRoom)
    return (
      owner.currRoom == target.currRoom ||
      (owner.currRoom == target.exitRoom && owner.exitRoom == target.currRoom)
    )
  }
  returnNpc(n: string): NpcState {
    return this.npcs.all[n]
  }
  returnPlayer(): WorldPlayer {
    return this.player
  }
}
