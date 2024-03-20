-- so for TS 
--global game = new world()
-- export game?
-- use merthods from and destructure game globally
-- like how old world state worked

local world = require "main.states.worldstate"
local ai = require "main.systems.ai.ai_main"

local M = {}

function M.init()
	world.init()
	ai.place_npcs()
end

return M