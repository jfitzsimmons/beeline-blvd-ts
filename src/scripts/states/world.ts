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
  //WorldTasksArgs,
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
    this.novel = new WorldNovel(roomsProps)
    this.tasks = new WorldTasks(roomsProps)
    const playerProps: WorldPlayerArgs = {
      world: {
        returnNpc: this.returnNpc.bind(this),
        // didCrossPaths: this.didCrossPaths.bind(this),
      },
      rooms: {
        getFocusedRoom: this.rooms.get_focused.bind(this),
        getOccupants: this.rooms.getOccupants.bind(this),
      },
      novel: {
        setConfrontation: this.novel.setConfrontation.bind(this),
      },
    }
    this.player = new WorldPlayer('hero', playerProps)
    const npcsProps: WorldNpcsArgs = {
      world: {
        returnPlayer: this.returnPlayer.bind(this),
        ...playerProps.world,
      },
      rooms: {
        clearStation: this.rooms.clearStation.bind(this),
        setStation: this.rooms.setStation.bind(this),
        checkSetStation: this.rooms.checkSetStation.bind(this),
        pruneStationMap: this.rooms.pruneStationMap.bind(this),
        getStationMap: this.rooms.getStationMap.bind(this),
        sendToVacancy: this.rooms.sendToVacancy.bind(this),
        getWards: this.rooms.getWards.bind(this),
        ...playerProps.rooms,
      },
      novel: {
        setConfrontation: this.novel.setConfrontation.bind(this),
      },
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
      .addState('turn', {
        onEnter: this.onTurnEnter.bind(this),
        onUpdate: this.onTurnUpdate.bind(this),
        onExit: this.onTurnExit.bind(this),
      })
  }
  private onNewEnter(): void {
    this.rooms.fsm.setState('turn')
    this.player.fsm.setState('place')
    this.npcs.fsm.setState('new') //Adds a PlaceSeq and runs it //also test defaults
    this.rooms.fsm.update(dt) // runs room based AI Behavior
    this.tasks.fsm.setState('turn')
    this.quests.fsm.setState('new')

    //debug defaults
    /**
    this.tasks.taskBuilder(
      'security004',
      'questioning',
      this.rooms.all.grounds.stations.guest === ''
        ? this.rooms.all.grounds.swaps.guest[1]
        : this.rooms.all.grounds.stations.guest,
      'testing'
    )**/
    this.npcs.addIgnore(this.rooms.all.grounds.stations.worker1)
  }
  private onNewUpdate(): void {}
  private onNewExit(): void {
    //print('WORLDNEWEXIT()!!! set npc-S ACTIVE')
    this.npcs.fsm.setState('active') //each npc gets set to 'active' which runs active behavior from newExit
  }
  private onTurnEnter(): void {
    print('<<< ::: AI TURN HAS ENDED ::: >>>')
  }
  private onTurnUpdate(): void {
    print('<<< ::: WORLDTurnUpdate() ::: >>>')
    /**
     * testjpf
     * do same place/active for player
     */
    this.player.fsm.setState('place')
    this.npcs.fsm.setState('place')
    this.clock = this.clock + 1
    if (this.clock > 23) this.clock = this.clock - 24
    this.player.fsm.update(dt)

    this.tasks.fsm.update(dt)
    print('!!!!! :::: PPPPP: Placing NPCS: Running...')
    this.npcs.fsm.update(dt)
    print('!!!! ::: PPPP: Placing NPCS: Finished.')
    this.rooms.fsm.update(dt) // runs room based AI Behavior
    this.player.fsm.setState('active')
    this.npcs.fsm.setState('active') // runs each NPC active Behavior
    print('????? :::: QQQQQ: Quest Related Status checks: Running...')
    this.quests.fsm.update(dt)
    print('???? ::: QQQQ: Quest Related Status checks: Finished.')
  }
  private onTurnExit(): void {}
  private onFaintEnter(): void {
    this.clock = this.clock + 6
    this.player.ap = this.player.apMax - 6
    this.player.hp = this.player.hpMax - 1
  }
  private onFaintUpdate(): void {
    print('XXXX ::: XXXX: worldFAINTupdate: Started...')
    this.player.fsm.setState('place')
    this.npcs.fsm.setState('place')
    if (this.clock > 23) this.clock = this.clock - 24
    this.player.fsm.update(dt)
    this.tasks.fsm.update(dt)
    this.npcs.fsm.update(dt)
    this.rooms.fsm.update(dt)
    this.player.fsm.setState('active')
    this.npcs.fsm.setState('active')
    this.quests.fsm.update(dt)
    this.fsm.setState('turn')
    print('XXX ::: XXX: worldFAINTupdate: Finished.')
  }
  private onFaintExit(): void {}
  returnNpc(n: string): NpcState {
    return this.npcs.all[n]
  }
  returnPlayer(): WorldPlayer {
    return this.player
  }
}
