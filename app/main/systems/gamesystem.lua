local world = require "main.states.worldstate"
local ai = require "main.systems.ai.ai_main"

local M = {}

function M.init()
	world.init()
	ai.place_npcs()
end

return M