/* eslint-disable @typescript-eslint/no-empty-function */

/**
const playerstate = require('main.states.playerstate')
const roomstates = require('main.states.roomstates')
const npcstates = require('main.states.npcstates')
const taskstates = require('main.states.taskstates')
const utils = require('main.utils.utils')

const M = {}
M.player = {}
M.rooms = {}
M.npcs = {}
M.tasks = {}
M.clock = 6

function new_game_state() {
	playerstate.new_player_state()
	roomstates.clear_room_stations()
	npcstates.new_npcs_state()
	taskstates.new_task_state()

	M.player = playerstate.state
	M.rooms = { 
		all = roomstates.all,
		fallbacks = roomstates.fallbacks
	}
	M.npcs = {
		all = npcstates.all,
		order = npcstates.order,
		ais = npcstates.ais
	}
	M.tasks = {
		cautions = taskstates.cautions,
		quests = taskstates.quests
	}
	M.clock = 6
}

function M.init() {
	new_game_state()
}

return M
**/

import StateMachine from './stateMachine'
import WorldRooms from './rooms'
import WorldPlayer from './player'

export default class World {
  private stateMachine: StateMachine
  //testjpf add player!!
  private player: WorldPlayer
  private rooms: WorldRooms
  private clock: number

  constructor() {
    this.stateMachine = new StateMachine(this, 'world')
    this.player = new WorldPlayer()
    this.rooms = new WorldRooms()
    this.clock = 6
    /**
     *testjpf
     * we create a room class. we import it
     * this.rooms = New Rooms()????
     * then use this.room.privatefunc() to update stations and things.
     *
     *
     * rooms should be it's own class with state amchine.
     * what states can it have, enter
     */
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
