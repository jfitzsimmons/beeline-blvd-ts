
local world = require "main.states.worldstate"
local npcs = require "main.states.npcstates"
local questutils = require "main.utils.quest"
local utils = require "main.utils.utils"
local checks = require "main.utils.checks"
local ai = require "main.systems.ai.ai_main"

local M = {}

local function tutorialA(interval)
	local luggage = world.rooms.all.grounds.actors.player_luggage.inventory
	if #luggage > 0 and interval=="turn" then
		local worker2 = world.npcs.all[world.rooms.all["grounds"].stations.worker2]
		local guest2 = world.npcs.all[world.rooms.all["grounds"].stations.guest2]

		if math.random() < 0.5 and worker2 ~= nil and worker2.cooldown <=0 then	
			print("Quest related checks:::")
			checks.steal_check(worker2,guest2,luggage) 
		elseif math.random() < 0.5 and guest2 ~= nil and guest2.cooldown <=0 then
			print("Quest related checks:::")
			checks.steal_check(guest2,worker2,luggage)
		end
	end
	
	if world.tasks.quests.tutorial.medic_assist.passed == false then
		if world.tasks.quests.tutorial.medic_assist.conditions[1].passed == true and
		interval=="turn" and
		world.rooms.all["grounds"].stations.worker1 ~= "" then
			print("placing a doctor!!!")
			local replace = utils.deepcopy(world.rooms.all.grounds.stations.aid)
			if replace ~= "" and 
			world.npcs.all[replace].clan ~= "doctors" then
				local docs = utils.shuffle(npcs.return_doctors())
				world.rooms.all[docs[1].currentroom].stations[docs[1].currentstation] = ""
				world.rooms.all.grounds.stations.aid = docs[1].labelname
				docs[1].currentroom = "grounds"
				docs[1].currentstation = "aid"
				print(replace, "has been REPLACED by:",docs[1].labelname)
				ai.npc_action_move(replace,ai.assign_nearby_rooms(world.player.matrix))
			end
		end
		if world.tasks.quests.tutorial.medic_assist.conditions[1].passed == true and
		interval=="interact" and
		world.tasks.quests.tutorial.medic_assist.conditions[2].passed == true and
		world.rooms.all["grounds"].stations.worker1 ~= "" and
		utils.has_value(world.player.inventory, hash("note")) == false and
		questutils.any_has_value({npcs.return_doctors, hash("vial02")}) == false then
			print("launch novel about ...here is a keycard get some meds")
			table.insert(world.player.inventory,  hash("note"))
			local params = {
				path = "grounds/tutorialmeds",
				npc = world.rooms.all["grounds"].stations.aid,
				reason = "apple",
				roomname = "grounds"
			}
			msg.post("proxies:/controller#novelcontroller", "show_scene", params)
		elseif world.tasks.quests.tutorial.medic_assist.conditions[1].passed == true and
		interval=="interact" and
		world.tasks.quests.tutorial.medic_assist.conditions[2].passed == true and
		world.rooms.all["grounds"].stations.worker1 ~= "" and
		utils.has_value(world.player.inventory, hash("note")) == true and
		questutils.any_has_value({npcs.return_doctors, hash("vial02")}) == true then
			print("PASSED")
			for _,iv in ipairs(world.player.inventory) do
				if iv == hash("note") then 
					local note = table.remove(world.player.inventory, _)
					table.insert(npcs.all[world.rooms.all["grounds"].stations.aid].inventory,  note)
					break
				end
			end
		print("testjpf TEXT script thank you, misson complete friend.")
		end
	end
end

local function tutorialAscripts(actor)
	local has_met = world.tasks.quests.tutorial.medic_assist.conditions[1].passed
	if actor ~= "player" and world.npcs.all[actor].clan == "doctors" and has_met == false then
		--testjpf could add conditional if encounters == 0 then 
		-- "I'm going as fast as i can" -doc
		return "tutorialAdoctor"
	end
	return ""
end

local function tutorialB()
	tutorialA()
end


M.spawn = "grounds"
M.scripts = {
	["tutorialAscripts"] = tutorialAscripts,
	--["tutorialB"] = tutorialBscripts,
}
M.checks = {
	["tutorialA"] = tutorialA,
	["tutorialB"] = tutorialB,
}

return M