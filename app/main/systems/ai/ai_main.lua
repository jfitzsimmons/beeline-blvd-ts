local world = require "main.states.worldstate"
local roomstates = require "main.states.roomstates"
local taskstates = require "main.states.taskstates"
local tasksystem = require "main.systems.tasksystem"
local chest = require "main.systems.inventorysystem"
local effects = require "main.systems.effectsystem"
local reception = require "main.systems.ai.levels.reception"
local utils = require "main.utils.utils"
local checks = require "main.utils.checks"

local initial_places = {"reception","baggage","customs","admin1","entrance","viplobby","loading",
"security","lockers","warehouse","alley1","commonsext","storage","commonsint","chapel","alley2",
"inn1","lobby","infirmary","recroom","pubgrill","gym","store","maintenance","alley3"}

local M = {}

local function attempt_to_fill_station(room_list,npc) 
	local placed = false
	local room = ""
	local misses = {}
	local current = world.npcs.all[npc].matrix

	--loop through priority room_list
	while placed == false do
		for _,room in ipairs(room_list) do
			local shuffled_stations = utils.shuffle(world.rooms.all[room].stations)
			for sname, station in pairs(shuffled_stations) do
				--loop thru room stations see if empty or has correct role
				if station == "" and utils.has_value(roomstates.roles[sname], world.npcs.all[npc].clan) then
					print(npc, ",went to ,", room, sname, ",from,",  roomstates.layout[current.y][current.x],",using,", world.npcs.all[npc].ai_path, ",TURNS,",world.npcs.all[npc].turns_since_encounter)
					--fill station
					world.npcs.all[npc].exitroom = roomstates.layout[current.y][current.x]
					world.npcs.all[npc].currentroom = room
					world.rooms.all[room].stations[sname] = npc
					world.npcs.all[npc].matrix = world.rooms.all[room].matrix
					world.npcs.all[npc].currentstation = sname
					placed = true
					if room ~= world.player.currentroom then
						world.npcs.all[npc].turns_since_encounter = world.npcs.all[npc].turns_since_encounter+1
					else
						world.npcs.all[npc].turns_since_encounter = 0 
					end
					break
				end
			end
			if placed == true then break end	
		end 
		-- fallback stations
		if placed == false then
			-- testjpf thought of idea to have a "non_placer" npc in each room.
			-- could have some dialog about being stranded. having to wait.
			if utils.has_value(room_list, "admin1") and world.rooms.fallbacks.stations["admin1_passer"] == "" and roomstates.layout[current.y][current.x] ~= "admin1" then
				print(npc, "passer A")
				world.rooms.fallbacks.stations["admin1_passer"] = npc
				world.npcs.all[npc].matrix = world.rooms.all["admin1"].matrix
			elseif utils.has_value(room_list, "security") and world.rooms.fallbacks.stations["admin1_passer"] == "" and roomstates.layout[current.y][current.x] ~= "security" then
				print(npc, "passer S")
				world.rooms.fallbacks.stations["security_passer"] = npc
				world.npcs.all[npc].matrix = world.rooms.all["security"].matrix
			elseif utils.has_value(room_list, "grounds") and world.rooms.fallbacks.stations["grounds_unplaced"] == "" then
				print(npc, "grounds_unplaced")
				world.rooms.fallbacks.stations["grounds_unplaced"] = npc
				world.npcs.all[npc].matrix = world.rooms.all["grounds"].matrix
			elseif utils.has_value(room_list, "reception") and world.rooms.fallbacks.stations["reception_unplaced"] == "" then
				print(npc, "recpt_unplaced")
				world.rooms.fallbacks.stations["reception_unplaced"] = npc
				world.npcs.all[npc].matrix = world.rooms.all["reception"].matrix
			else
				print(npc, "TESTJPF DID NOT PLACE AT ALL from: ", roomstates.layout[current.y][current.x])
				for _,roomadjtestjpf in pairs(room_list) do
					print(npc, "could not place in:", roomadjtestjpf)
				end
			end
			placed = true
		end
	end
end

--target: room npc wants to get to
--current: room npc is in
local function set_room_priority(target,npc) 
	local room_list = {}
	local current = world.npcs.all[npc].matrix

	--get list of possible rooms NPC could go to next in order to get to target
	if target.y > current.y then
		table.insert(room_list,roomstates.layout[current.y+1][current.x])
	end
	if target.x < current.x then
		table.insert(room_list,roomstates.layout[current.y][current.x - 1])
	end
	if target.y < current.y then
		table.insert(room_list,roomstates.layout[current.y-1][current.x])
	end
	if target.x > current.x then
		table.insert(room_list,roomstates.layout[current.y][current.x+1])
	end

	table.insert(room_list,roomstates.layout[current.y][current.x])

	if target.y > current.y and current.y-1 ~= 0 and roomstates.layout[current.y-1][current.x] ~=nil then
		table.insert(room_list,roomstates.layout[current.y-1][current.x])
	end
	if target.x > current.x and roomstates.layout[current.y][current.x-1] ~=nil then
		table.insert(room_list,roomstates.layout[current.y][current.x-1])
	end
	if target.y <= current.y and current.y < 6 and roomstates.layout[current.y+1][current.x] ~=nil then
		table.insert(room_list,roomstates.layout[current.y+1][current.x])
	end
	if target.x <= current.x and roomstates.layout[current.y][current.x + 1] ~=nil then
		table.insert(room_list,roomstates.layout[current.y][current.x + 1])
	end
	if world.npcs.all[npc].home then
		table.insert(room_list,roomstates.layout[world.npcs.all[npc].home.y][world.npcs.all[npc].home.x])
	end

	return room_list
end

local function set_npc_target(direction, n)
	local npc = world.npcs.all[n]
	local target = {x=0,y=0}
	if npc.turns_since_encounter > 20 then
		target = world.player.matrix	
	elseif npc.ai_path == "pinky" then 
		--always targets 1 to 3 rooms infront of player
		target = direction.front 
	elseif npc.ai_path == "blinky" then 
		--always targets 1 room behind of player
		local distance = (npc.matrix.x-npc.home.x) + (npc.matrix.y-npc.home.y)
		if distance < -5 or distance > 5 then
			target = npc.home
		else 
			target = direction.back 
		end
	elseif npc.ai_path == "inky" then 
		--1/3 check to see if you 1: too far from home or 2: 50/50 left/right
		local distance = 0
		if math.random() < 0.33 then 
			distance = ((npc.matrix.x-world.player.matrix.x) + (npc.matrix.y-world.player.matrix.y))
		else
			distance = 9
		end
		if distance > -2 and distance < 2 then
			target = npc.home
		else 
			if math.random() <.5 then 
				target = direction.right 
			else 
				target = direction.left 
			end
		end
	elseif npc.ai_path == "clyde" then 
		local distance = ((npc.matrix.x-world.player.matrix.x) + (npc.matrix.y-world.player.matrix.y))
		--random front, back, left, right unless too close and fail 50/50 check
		if distance > -2 and distance < 2 and math.random() > 0.5 then
			target = npc.home
		else 
			local dirs = utils.shuffle({"front","back","left","right"})
			target = direction[dirs[1]] 
		end
	end
	--limit target to map layout grid
	if target.x < 1 then target.x = 1
	elseif target.x > 6 then target.x = 6
	end

	if target.y < 1 then target.y = 1
	elseif target.y > 6 then target.y = 6
	end

	return target
end

function M.assign_nearby_rooms(enter)
	local exit = world.player.matrix	
	local direction = {
		front = {x = 0, y = 0}, 
		back = {x = 0, y = 0},
		left = {x = 0, y = 0},
		right = {x = 0, y = 0}, 
	}
	--get directions based on way exit is facing
	if exit.x > enter.x then 
		direction = {
			front = {x = enter.x -math.random(0,2), y = enter.y},
			back = {x = enter.x +2, y = enter.y},
			left = {x = enter.x, y = enter.y+1},
			right = {x = enter.x, y = enter.y-1}
		}
	elseif exit.y < enter.y then 
		direction = {
			front = {x = enter.x, y = enter.y +math.random(0,2)},
			back = {x = enter.x, y = enter.y -2},
			left = {x = enter.x+1, y = enter.y},  
			right = {x = enter.x-1, y = enter.y} 
		}
	elseif exit.y > enter.y then 
		direction = {
			front = {x = enter.x, y = enter.y -math.random(0,2)},
			back = {x = enter.x, y = enter.y +2},
			left = {x = enter.x-1, y = enter.y},
			right = {x = enter.x+1, y = enter.y}  
		}
	else
		direction = {
			front = {x = enter.x +math.random(0,2), y = enter.y}, 
			back = {x = enter.x -2, y = enter.y},
			left = {x = enter.x, y = enter.y-1}, 
			right = {x = enter.x, y = enter.y+1}  
		}
	end
	return direction
end

local function release_prisoners(d)
	for station,prisoner in pairs(world.rooms.all.security.prisoners) do
		if prisoner ~= "" and world.npcs.all[prisoner].cooldown <=0 then
			print("released from prison:", prisoner)
			M.npc_action_move(prisoner,d)
			world.rooms.all.security.prisoners[station] = ""	
		end
	end
end

-- testjpf naming conventions start getting vague
local function ai_actions(direction)
	release_prisoners(direction)
	reception.steal_stash_checks()
end



function M.npc_action_move(n, d)
	local npc = world.npcs.all[n]
	local target = set_npc_target(d, n)
	local room_list = set_room_priority(target, n)
	attempt_to_fill_station(room_list, n)
	effects.remove_effects(npc)
	if npc.cooldown > 0 then npc.cooldown = npc.cooldown - 1 end
end

-- testjpf So far this is just run on init
function M.place_npcs()
	local npcs = world.npcs
	local rooms = world.rooms
	-- NPC with longest since encounter with p (Randomized on init)
	table.sort(npcs.order, function(a, b) return npcs.all[a].turns_since_encounter > npcs.all[b].turns_since_encounter end)
	for k,v in pairs(npcs.order) do
		local npc = npcs.all[v]		
		local placed = false
		--tries to place NPC at grounds - level 1
		local shuffled_stations = utils.shuffle(rooms.all.grounds.stations)
		for sname, station in pairs(shuffled_stations) do
			if station == "" and utils.has_value(roomstates.roles[sname], npc.clan) then
				rooms.all.grounds.stations[sname] = npc.labelname
				npc.matrix = rooms.all.grounds.matrix
				npc.currentstation = sname
				print("GROUNDS::: ", npc.labelname,"placed in", sname)
				placed = true
				break
			end
		end
		if placed == false then
			for _,place in ipairs(initial_places) do
				--tries to place NPC at nearby rooms
				shuffled_stations = utils.shuffle(rooms.all[place].stations)
				for sname, station in pairs(shuffled_stations) do
					if station == "" and utils.has_value(roomstates.roles[sname], npc.clan) then
						rooms.all[place].stations[sname] = npc.labelname
						npc.matrix = rooms.all[place].matrix
						npc.currentstation = sname
						print("RANDOM::: ", npc.labelname,"placed in", sname,"ROOM",place)
						placed = true
						break
					end
				end
				if placed == true then
					break
				end
			end
		end
	end
end

function M.ai_turn(enter)
	local npcs = world.npcs.all
	local rooms = world.rooms
	local direction = M.assign_nearby_rooms(rooms.all[enter].matrix)
	-- NPC gone longest since encountering player moves first
	table.sort(world.npcs.order, function(a, b) return npcs[a].turns_since_encounter > npcs[b].turns_since_encounter end)

	for _,v in ipairs(world.npcs.order) do
		M.npc_action_move(v,direction)
	end

	ai_actions(direction)
end

function M.witness(w)
	local suspect = world.player
	local watcher = world.npcs.all[w]
	local consequence =  {
		confront = false,
		type = "neutral"
	}

	-- is an NPC watching?
	if watcher ~= nil and checks.seen_check(suspect.skills, watcher.skills) == true then
		-- should NPC confront suspect?
		if checks.confrontation_check(suspect,watcher) == true then
			consequence.confront = true
			consequence.type = "confront"
		else
			consequence.type = taskstates.consulation_checks(watcher.binaries,watcher.skills)
		end
		if consequence.confront == false and consequence.type ~= "neutral" then
			taskstates.caution_builder(watcher, consequence.type, "player", "theft")
		else
			print("player seen but not confronted by", w)
		end 
	else
		print("No one is Watching")
	end
	return consequence
end

return M