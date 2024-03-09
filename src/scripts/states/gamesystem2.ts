/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/** const playerstate = require "main.states.playerstate"
const roomstates = require "main.states.roomstates"
const npcstates = require "main.states.npcstates"
const taskstates = require "main.states.taskstates"
const utils = require "main.utils.utils"
**/

import World from './world'
//import { WorldState, GameState } from '../../types/state'

/**
const M = {}
M.player = {}
M.rooms = {}
M.npcs = {}
M.tasks = {}
M.clock = 6

const function new_game_state()
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
end

function M.init()
	new_game_state()
end

return M
 
-- so for TS 
--global game = new world()
-- export game?
-- use merthods from and destructure game globally
-- like how old world state worked

const world = require "main.states.worldstate"
const ai = require "main.systems.ai.ai_main"

const M = {}

function M.init()
	world.init()
	ai.place_npcs()
end

return M

const testjpf = () => {
  return {
    world: new World(),
    testjpf2: 'testjpf2',
  }
}
export default testjpf
**/

export class Game {
  public world: World
  constructor() {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call
    this.world = new World()
  }
}

export const newGame = new Game()
