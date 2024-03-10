const world = require( "main.states.worldstate")
const roomstates = require( "main.states.roomstates")
const taskstates = require( "main.states.taskstates")
const tasksystem = require( "main.systems.tasksystem")
const chest = require( "main.systems.inventorysystem")
const effects = require( "main.systems.effectsystem")
const reception = require( "main.systems.ai.levels.reception")
const utils = require( "main.utils.utils")
const checks = require( "main.utils.checks")

const initial_places = ["reception","baggage","customs","admin1","entrance","viplobby","loading",
"security","lockers","warehouse","alley1","commonsext","storage","commonsint","chapel","alley2",
"inn1","lobby","infirmary","recroom","pubgrill","gym","store","maintenance","alley3"]



 function attempt_to_fill_station(room_list,npc) {
	let placed = false
	const room = ""
	const misses = {}
	const current = world.npcs.all[npc].matrix

	//loop through priority room_list
	while (placed == false) {

		room_list.forEach((r:string) => {


	//	for w,room in ipairs(room_list) do
			const shuffled_stations = utils.shuffle(world.rooms.all[room].stations)

			let ks: keyof typeof shuffled_stations // Type is "one" | "two" | "three"
			for (ks in shuffled_stations) {
				const station = shuffled_stations[ks] 

				if (station == "" && utils.has_value(roomstates.roles[ks], npc.clan)) {

					//for sname, station in pairs(shuffled_stations) do
					//loop thru room stations see if empty or has correct role
					//if (station == "" && utils.has_value(roomstates.roles[sname], world.npcs.all[npc].clan)) {
					print(npc, ",went to ,", room, ks, ",from,",  roomstates.layout[current.y][current.x],",using,", world.npcs.all[npc].ai_path, ",TURNS,",world.npcs.all[npc].turns_since_encounter)
					//fill station
					world.npcs.all[npc].exitroom = roomstates.layout[current.y][current.x]
					world.npcs.all[npc].currentroom = room
					world.rooms.all[room].stations[ks] = npc
					world.npcs.all[npc].matrix = world.rooms.all[room].matrix
					world.npcs.all[npc].currentstation = ks
					placed = true
					if (room != world.player.currentroom) {
						world.npcs.all[npc].turns_since_encounter = world.npcs.all[npc].turns_since_encounter+1
					}else{
						world.npcs.all[npc].turns_since_encounter = 0 
					}
					break
				}
			}
			if( placed == true) { break }	
		
		})
		// fallback stations
		if (placed == false) {
			// testjpf thought of idea to have a "non_placer" npc in each room.
			// could have some dialog about being stranded. having to wait.
			if (utils.has_value(room_list, "admin1") && world.rooms.fallbacks.stations["admin1_passer"] == "" && roomstates.layout[current.y][current.x] != "admin1") {
				print(npc, "passer A")
				world.rooms.fallbacks.stations["admin1_passer"] = npc
				world.npcs.all[npc].matrix = world.rooms.all["admin1"].matrix
			}else if (utils.has_value(room_list, "security") && world.rooms.fallbacks.stations["admin1_passer"] == "" && roomstates.layout[current.y][current.x] != "security") {
				print(npc, "passer S")
				world.rooms.fallbacks.stations["security_passer"] = npc
				world.npcs.all[npc].matrix = world.rooms.all["security"].matrix
			}else if (utils.has_value(room_list, "grounds") && world.rooms.fallbacks.stations["grounds_unplaced"] == "") {
				print(npc, "grounds_unplaced")
				world.rooms.fallbacks.stations["grounds_unplaced"] = npc
				world.npcs.all[npc].matrix = world.rooms.all["grounds"].matrix
			}else if (utils.has_value(room_list, "reception") && world.rooms.fallbacks.stations["reception_unplaced"] == "") {
				print(npc, "recpt_unplaced")
				world.rooms.fallbacks.stations["reception_unplaced"] = npc
				world.npcs.all[npc].matrix = world.rooms.all["reception"].matrix
			}else{
				print(npc, "TESTJPF DID NOT PLACE AT ALL from: ", roomstates.layout[current.y][current.x])
			}
			placed = true
		}
	}
}

//target: room npc wants to get to
//current: room npc is in
 function set_room_priority(target,npc) {
	const room_list = []
	const current = world.npcs.all[npc].matrix

	//get list of possible rooms NPC could go to next in order to get to target

	//testjpf 
	if (target.y > current.y) {
		room_list.push(roomstates.layout[current.y+1][current.x])
	}
	if (target.x < current.x) {
		room_list.push(roomstates.layout[current.y][current.x - 1])
	}
	if (target.y < current.y) {
		room_list.push(roomstates.layout[current.y-1][current.x])
	}
	if (target.x > current.x ){
		room_list.push(roomstates.layout[current.y][current.x+1])
	}

	room_list.push(roomstates.layout[current.y][current.x])

	if (target.y > current.y && current.y-1 != 0 && roomstates.layout[current.y-1][current.x] !=null) {
		room_list.push(roomstates.layout[current.y-1][current.x])
	}
	if (target.x > current.x && roomstates.layout[current.y][current.x-1] !=null) {
		room_list.push(roomstates.layout[current.y][current.x-1])
	}
	if (target.y <= current.y && current.y < 6 && roomstates.layout[current.y+1][current.x] !=null ){
		room_list.push(roomstates.layout[current.y+1][current.x])
	}
	if (target.x <= current.x && roomstates.layout[current.y][current.x + 1] !=null) {
		room_list.push(roomstates.layout[current.y][current.x + 1])
	}
	if (world.npcs.all[npc].home) {
		room_list.push(roomstates.layout[world.npcs.all[npc].home.y][world.npcs.all[npc].home.x])
	}

	return room_list
}

function set_npc_target(direction, n) {
	const npc = world.npcs.all[n]
	let target = {x=0,y=0}
	if (npc.turns_since_encounter > 20) {
		target = world.player.matrix	
	}else if (npc.ai_path == "pinky") { 
		//always targets 1 to 3 rooms infront of player
		target = direction.front 
	}else if (npc.ai_path == "blinky") { 
		//always targets 1 room behind of player
		const distance = (npc.matrix.x-npc.home.x) + (npc.matrix.y-npc.home.y)
		if (distance < -5 || distance > 5) {
			target = npc.home
		}else {
			target = direction.back 
		}
	}else if ( npc.ai_path == "inky") { 
		//1/3 check to see if you 1: too far from home or 2: 50/50 left/right
		let distance = 0
		if (math.random() < 0.33) { 
			distance = ((npc.matrix.x-world.player.matrix.x) + (npc.matrix.y-world.player.matrix.y))
		}else{
			distance = 9
		}
		if (distance > -2 && distance < 2) {
			target = npc.home
		}else{
			if (math.random() <.5) { 
				target = direction.right 
			}else {
				target = direction.left 
			}
		}
	}else if (npc.ai_path == "clyde") { 
		const distance = ((npc.matrix.x-world.player.matrix.x) + (npc.matrix.y-world.player.matrix.y))
		//random front, back, left, right unless too close and fail 50/50 check
		if (distance > -2 && distance < 2 && math.random() > 0.5) {
			target = npc.home
		}else {
			const dirs = utils.shuffle(["front","back","left","right"])
			target = direction[dirs[1]] 
		}
	}
	//limit target to map layout grid
	if (target.x < 1) {target.x = 1}
	else if( target.x > 6) { target.x = 6}
	

	if (target.y < 1)  {target.y = 1}
	else if (target.y > 6)  {target.y = 6}
	

	return target
}

export function assign_nearby_rooms(enter) {
	const exit = world.player.matrix	
	let direction = {
		front:{x:0, y:0}, 
		back:{x:0, y:0},
		left:{x:0, y:0},
		right:{x:0, y:0}, 
	}
	//get directions based on way exit is facing
	if (exit.x > enter.x) { 
		direction={
			front:{x:enter.x -math.random(0,2), y:enter.y},
			back:{x:enter.x +2, y:enter.y},
			left:{x:enter.x, y:enter.y+1},
			right:{x:enter.x, y:enter.y-1}
		}
	}else if (exit.y < enter.y ){ 
		direction={
			front:{x:enter.x, y:enter.y +math.random(0,2)},
			back:{x:enter.x, y:enter.y -2},
			left:{x:enter.x+1, y:enter.y},  
			right:{x:enter.x-1, y:enter.y} 
		}
	}else if (exit.y > enter.y ){ 
		direction={
			front:{x:enter.x, y:enter.y -math.random(0,2)},
			back:{x:enter.x, y:enter.y +2},
			left:{x:enter.x-1, y:enter.y},
			right:{x:enter.x+1, y:enter.y}  
		}
	}else {
		direction={
			front:{x:enter.x +math.random(0,2), y:enter.y}, 
			back:{x:enter.x -2, y:enter.y},
			left:{x:enter.x, y:enter.y-1}, 
			right:{x:enter.x, y:enter.y+1}  
		}
	}
	return direction
}

local function release_prisoners(d)
	for station,prisoner in pairs(world.rooms.all.security.prisoners) do
		if prisoner != "" and world.npcs.all[prisoner].cooldown <=0 then
			print("released from prison:", prisoner)
			M.npc_action_move(prisoner,d)
			world.rooms.all.security.prisoners[station] = ""	
		end
	end
end

// testjpf naming conventions start getting vague
local function ai_actions(direction)
	release_prisoners(direction)
	reception.steal_stash_checks()
end



export function npc_action_move(n, d) {
	const npc = world.npcs.all[n]
	const target = set_npc_target(d, n)
	const room_list = set_room_priority(target, n)
	attempt_to_fill_station(room_list, n)
	effects.remove_effects(npc)
	if (npc.cooldown > 0)  npc.cooldown = npc.cooldown - 1 
}

// testjpf So far this is just run on init
export function place_npcs() {
	const npcs = world.npcs
	const rooms = world.rooms
	// NPC with longest since encounter with p (Randomized on init)

	npcs.order.sort(function(a:string,b:string) { 
		return npcs.all[a].turns_since_encounter > npcs.all[b].turns_since_encounter; 
	});

	//table.sort(npcs.order, function(a, b) return npcs.all[a].turns_since_encounter > npcs.all[b].turns_since_encounter end)
	npcs.order.forEach((n:string) => {
		const npc = npcs.all[n]		
		let placed = false
		//tries to place NPC at grounds - level 1
		let shuffled_stations = utils.shuffle(rooms.all.grounds.stations)

		let ks: keyof typeof shuffled_stations // Type is "one" | "two" | "three"
		for (ks in shuffled_stations) {
			const station = shuffled_stations[ks] 
			if (station == "" && utils.has_value(roomstates.roles[ks], npc.clan)) {
				rooms.all.grounds.stations[ks] = npc.labelname
				npc.matrix = rooms.all.grounds.matrix
				npc.currentstation = ks
				print("GROUNDS::: ", npc.labelname,"placed in", ks)
				placed = true
				break
			}
		}
		if (placed == false) {
			initial_places.forEach(p =>{
				shuffled_stations = utils.shuffle(rooms.all[p].stations)

				for (ks in shuffled_stations) {
					const station = shuffled_stations[ks] 

					if (station == "" && utils.has_value(roomstates.roles[ks], npc.clan)) {

					rooms.all[p].stations[ks] = npc.labelname
					npc.matrix = rooms.all[p].matrix
					npc.currentstation = ks
					print("RANDOM::: ", npc.labelname,"placed in", ks,"ROOM",p)
					placed = true
					break
					}
				}
				if (placed == true) {
					break
				}
			})
		}
	  })
	}

export function ai_turn(enter){
	const npcs = world.npcs.all
	const rooms = world.rooms
	const direction = assign_nearby_rooms(rooms.all[enter].matrix)
	// NPC gone longest since encountering player moves first
	npcs.sort_npcs_by_encounter()
	/**npcs.order.sort(function(a:string,b:string) { 
		return npcs.all[a].turns_since_encounter > npcs.all[b].turns_since_encounter; 
	});**/

npcs.order.array.forEach(n => {
	npc_action_move(n,direction)
});


	ai_actions(direction)
}

function M.witness(w)
	local suspect = world.player
	local watcher = world.npcs.all[w]
	local consequence =  {
		confront = false,
		type = "neutral"
	}

	// is an NPC watching?
	if watcher != null and checks.seen_check(suspect.skills, watcher.skills) == true then
		// should NPC confront suspect?
		if checks.confrontation_check(suspect,watcher) == true then
			consequence.confront = true
			consequence.type = "confront"
		else
			consequence.type = taskstates.consulation_checks(watcher.binaries,watcher.skills)
		end
		if consequence.confront == false and consequence.type != "neutral" then
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