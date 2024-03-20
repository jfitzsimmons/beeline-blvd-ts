local world = require "main.states.worldstate"
local quest = require "main.systems.quests.quest_main"

local N = {}

function N.novelclose(merits, turns, alert, arrested)
	msg.post("novel:/main#main", "sleep", {merits = merits, turns = turns, alert = alert, arrested = arrested})
end

function N.punch()
	world.player.hp = world.player.hp -1
	if world.player.hp <= 0 then
		msg.post("novel:/main#main", "sleep", {merits = merits, turns = turns, faint = true})
	end
end

function N.script_builder(npc,room,station,caution,extend)
	local checkpoint = world.player.checkpoint:sub(1, -2)
	local path = quest.checkpoints[checkpoint].scripts[world.player.checkpoint .. "scripts"](npc)

	if extend == true then checkpoint = world.player.checkpoint end

	if path == "" then
		if room ~=nil then path = path .. room .. "/" end
		path = path .. checkpoint
		if station ~=nil then path = path .. station end
		if caution ~=nil then path = path .. caution end
	end
	print("PATH:::",path)
	return path
end

return N 