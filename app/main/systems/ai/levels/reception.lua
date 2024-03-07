local world = require "main.states.worldstate"
local checks = require "main.utils.checks"

local M = {}

function M.steal_stash_checks()
	local victim = nil
	local thief =  nil
	local actor =  {}
	local loot = {}
	local attendant = world.npcs.all[world.rooms.all.reception.stations.desk]
	--print("world.rooms.all.reception.stations.guest",world.rooms.all.reception.stations.guest)
	if world.rooms.all.reception.stations.guest ~= "" then 
		victim = world.npcs.all[world.rooms.all.reception.stations.guest]
		--print("victim.labelname",victim.labelname)
		
		loot = victim.inventory 
		actor = world.rooms.all.reception.actors.drawer 
		if #actor.inventory > 0  and world.rooms.all.reception.stations.desk == "" then 
			if math.random() < 0.5 then checks.take_check(victim,actor) end
		elseif #actor.inventory > 0 then
			if math.random() < 0.5 then checks.steal_check(victim,attendant,actor.inventory) end
		end
	end

	if world.rooms.all.reception.stations.loiter4 ~= "" then 
		thief = world.npcs.all[world.rooms.all.reception.stations.loiter4]
	end
	if victim ~= nil and thief ~= nil and #loot > 0 and thief.cooldown <=0 then
		if math.random() < 0.5 then	
			checks.steal_check(thief,victim,loot) 
		end
	end
	if world.rooms.all.reception.stations.desk ~= "" then 
		actor = world.rooms.all.reception.actors.drawer 
		checks.take_or_stash(attendant,actor)
	end
	if world.rooms.all.reception.stations.patrol ~= "" then 
		attendant = world.npcs.all[world.rooms.all.reception.stations.patrol]
		actor = world.rooms.all.reception.actors.vase2 
		checks.take_or_stash(attendant,actor)
	end
	if world.rooms.all.reception.stations.loiter2 ~= "" then 
		attendant = world.npcs.all[world.rooms.all.reception.stations.loiter2]
		actor = world.rooms.all.reception.actors.vase
		checks.take_or_stash(attendant,actor)
	end
end

return M