local playerstate = require "main.states.playerstate"
local roomstates = require "main.states.roomstates"
local npcstates = require "main.states.npcstates"
local taskstates = require "main.states.taskstates"
local utils = require "main.utils.utils"

local M = {}
M.player = {}
M.rooms = {}
M.npcs = {}
M.tasks = {}
M.clock = 6

local function new_game_state()
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