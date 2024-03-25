--local world = require "main.states.worldstate"
--local quest = require "app._support.deleted.systemss.quests.quest_main"

local N = {}

function N.novelclose(merits, turns, alert, arrested)
	msg.post("novel:/main#main", "sleep", {merits = merits, turns = turns, alert = alert, arrested = arrested})
end

function N.punch()
	--world.player.hp = world.player.hp -1
	--if world.player.hp <= 0 then
	--	msg.post("novel:/main#main", "sleep", {merits = merits, turns = turns, faint = true})
	--end
end



return N 