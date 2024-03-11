local world = require "main.states.worldstate"
local roomstates = require "main.states.roomstates"
local taskstates = require "main.states.taskstates"
local utils = require "main.utils.utils"
local fx = require "main.systems.effectsystem"
local chest = require "main.systems.inventorysystem"

local M = {}

local function go_to_jail(suspect)
	--testjpf not sure if i should loop through cautions and 
	-- remove all arrests for suspect(clear record)
	print("found:",suspect," ARREST!!!!")
	taskstates.remove_heat(suspect)
	for pk,pv in pairs(world.rooms.all.security.prisoners) do
		if pv == "" then
			world.rooms.all.security.prisoners[pk] = suspect
			world.npcs.all[suspect].matrix = world.rooms.all.security.matrix
			world.npcs.all[suspect].cooldown = 6

			print(suspect, "is in jail for:", world.npcs.all[suspect].cooldown,"as", pk, world.rooms.all.security.prisoners[pk] )
			break
			--testjpf if jail full, kick outside of hub
		end
	end
end

local function snitch_to_security(c, watcher)
	print(c.npc, "SNITCHED")
	local caution_state = "questioning"
	if c.suspect == "player" then
		if world.player.alert_level > 1 then caution_state = "arrest" end
		world.player.alert_level = world.player.alert_level + 1  	
	elseif math.random() < 0.33 then
		caution_state = "arrest"
	end

	local bulletin = taskstates.already_hunting(watcher, c.suspect)
	if bulletin == nil then
		taskstates.caution_builder(
			world.npcs.all[watcher], 
			caution_state, 
			c.suspect,
			c.reason
		)
	else
		bulletin.time  = bulletin.time + 6
		if c.suspect == "player" then
			world.player.alert_level = world.player.alert_level + 1
		else
			world.npcs.all[watcher].attitudes[world.npcs.all[c.suspect].clan] = world.npcs.all[watcher].attitudes[world.npcs.all[c.suspect].clan] - 1
		end
	end
	if world.player.alert_level > 2 and 
	taskstates.plan_on_snitching(watcher, c.suspect) == false then 
		taskstates.caution_builder(
			world.npcs.all[watcher], 
			"snitch", 
			c.suspect,
			c.reason
		)
	end

	c.time = 0
end

local function reckless_consequence(c, w)
	print("RC::: ",c.npc," is gossiping with", w) 
	local watcher = world.npcs.all[w]
	local effects_list = {}

	if c.reason == "theft" and watcher.binaries.evil_good > 0.5 and watcher.skills.wisdom > 5 then
		if c.suspect ~= "player" then
			effects_list = {"crimewave", "inspired","eagleeye","modesty"}
		else
			watcher.love = watcher.love - 2
		end
	elseif c.reason == "theft" and watcher.binaries.lawless_lawful < -0.5 and watcher.skills.intelligence < 4 then
		if c.suspect ~= "player" then
			effects_list = {"admirer", "opportunist","inspired","amped"}		
		else
			watcher.love = watcher.love + 2
		end
	elseif c.reason == "theft" and watcher.binaries.un_educated < -0.5 and watcher.skills.perception < 4 then
		if c.suspect ~= "player" then
			effects_list = {"prejudice", "incharge","boring","loudmouth"}
		else
			watcher.love = watcher.love + 2
		end
	elseif c.reason == "harassing" and watcher.binaries.evil_good < -0.6 and watcher.binaries.passive_aggressive > 0.6 then
		if c.suspect ~= "player" then
			effects_list = {"inspired", "opportunist","vanity","inhiding"}
		else		
			watcher.love = watcher.love + 2
		end
	elseif c.reason == "harassing" and watcher.binaries.un_educated > 0.4 and watcher.skills.perception > 4 then
		if c.suspect ~= "player" then
			effects_list = {"crimewave", "inshape","readup","modesty"}
		else	
			watcher.love = watcher.love - 2
		end
	end	
	if #effects_list > 0 then 
		local fx_labels = utils.shuffle(effects_list)
		local effect = utils.deepcopy(fx.all[fx_labels[1]])
		effect.label = fx_labels[1]
		if effect.fx.type == "attitudes" then
			effect.fx.stat =  world.npcs.all[c.suspect].clan
		end
		fx.add_effects_bonus(watcher, effect)
		print("RC:::",watcher.labelname, "has a new effect", effect.label, "because of gossip from", c.npc, "that", c.suspect, "was caught for", c.reason)
		table.insert(world.npcs.all[watcher.labelname].effects,effect) -- lawfulness increase? 
	else
		if c.suspect ~= "player" then
			local caution = taskstates.consulation_checks(watcher.binaries,watcher.skills)
			if caution ~= "neutral" and caution ~= "reckless" then
				print("RC:::",watcher.labelname, "has NO effect but a caution:", caution, "because of gossip from", c.npc, "that", c.suspect, "was caught for", c.reason)
				taskstates.caution_builder(watcher, caution, c.suspect, c.reason)
			else
				print("reckless_consequence: no fx or cautions")
			end
		else	
			watcher.love = watcher.love - 1
		end
	end
end



--testjpf maybe later abstract to security tasks? sub tasks?
-- or i could see other systems using this method
function M.question_consequence(c)
	print("QC::: ", c.npc, "is NOW questioning:",c.suspect)	
	local w = world.npcs.all[c.npc]
	local s = world.npcs.all[c.suspect]

	if w.binaries.passive_aggressive <= s.binaries.passive_aggressive and w.skills.wisdom >= s.skills.constitution then
		print("QC:: promise")--promise not to do it again
		s.cooldown = s.cooldown + 8
	elseif w.binaries.lawless_lawful < -0.4 and w.skills.strength >= s.skills.strength and s.binaries.passive_aggressive < 0.0 then
		if #s.inventory > 0 then
			for _,item in pairs(s.inventory) do
				if chest.items[item].value > 1 then
					local loot = table.remove(s.inventory,_)
					print("QC:: bribed.", w.labelname, "extorted", loot, "from", s.labelname)
					table.insert(w.inventory,loot)
					break
				else
					print("bribe failed so punch???")
					-- bribe failed so punch???
				end
			end
		end
		print("QC:: bribed --- if described above (else, nothing to steal)")
	elseif w.skills.intelligence < 5 and w.binaries.evil_good < -0.3 and w.skills.constitution >= s.skills.speed then
		-- watcher punches suspect
		print("QC:: w punches s")
		s.hp = s.hp -1
	elseif w.binaries.anti_authority > 0.3 and w.skills.perception >= s.skills.perception and s.binaries.passive_aggressive <= 0.0 then
		print("QC:: jailtime.", w.labelname, "threw", s.labelname, "in jail for lying while questioning")
		go_to_jail(s.labelname)
	elseif w.skills.charisma <= s.skills.charisma and w.binaries.anti_authority < -0.3 and w.skills.perception < 5 then
		print("QC:: admirer")
		local effect = utils.deepcopy(fx.all.admirer)
		effect.fx.stat = s.clan
		table.insert(w.effects,effect)
		fx.add_effects_bonus(w, effect)
	elseif w.skills.wisdom < 4 and s.binaries.poor_wealthy < w.binaries.poor_wealthy and w.skills.charisma < w.skills.stealth then
		print("QC:: prejudice")
		local effect = utils.deepcopy(fx.all.prejudice)
		effect.fx.stat = s.clan
		table.insert(w.effects,effect)
		fx.add_effects_bonus(w, effect)
	elseif math.random() < 0.5 then 
		--testjpf not sure what to do here
		--lessser sentence
		--misdemeanor??
		print("QC:: UNLUCKY ARREST.", w.labelname, "threw", s.labelname, "in jail for unlucky QUESTIONING")
		go_to_jail(s.labelname)
	else
		if suspect ~= "player" then
			local caution = taskstates.consulation_checks(w.binaries,w.skills)
			if caution ~= "neutral" then
				taskstates.caution_builder(w, caution, suspect, c.reason)
			else
				print("QUESTIONING_consequence: no fx or cautions")
			end
		else	
			w.love = w.love -1
		end
	end
	c.time = 0
end

function M.address_cautions()
	local player = world.player
	local npcs = world.npcs
	local cautions = world.tasks.cautions
	local confront = nil

	for _,c in pairs(cautions) do
		confront = {
			npc = c.npc,
			station = "", 
			state= c.state,
			reason= c.reason
		}
		-- print("ADDRESS CAUTIONS - c.suspect :",c.suspect)
		local agent = npcs.all[c.npc]
		local suspect = player
		if c.suspect ~= "player" then suspect = npcs.all[c.suspect] end
		
		-- in the same room for quesitioning
		if c.state == "questioning" and (agent.currentroom == suspect.currentroom or (agent.currentroom == suspect.exitroom and agent.exitroom == suspect.currentroom)) then
			c.time = 0
			if c.suspect == "player" then
				print(c.npc, "has found player. QUESTIONING!!!! STATION:::", suspect.name)
				confront.station = suspect.name
			else
				question_consequence(c)
				confront = nil
			end
		-- in the same room for arrest
	elseif c.state == "arrest" and (agent.currentroom == suspect.currentroom or (agent.currentroom == suspect.exitroom and agent.exitroom == suspect.currentroom)) then
			c.time = 0
			if c.suspect == "player" then
				print(c.npc, "has found player. ARREST!!!! STATION:::", s_name)
				confront.station = s_name
			else
				print("CAUTION:: arrest.", c.npc, "threw", c.suspect, "in jail")
				go_to_jail(c.suspect)
				confront = nil
			end
		else
			--loop through stations in room of task agent
			for s_name,watcher in pairs(world.rooms.all[agent.currentroom].stations) do
				confront = nil
				--is watcher present?, is caution active?
				if watcher ~= "" and c.state ~= "neutral" and 
				c.time > 0 and watcher ~= c.npc and watcher ~= c.suspect then
					if c.state == "reckless" then
						reckless_consequence(c, watcher)
					-- is the watcher an authority for this task
					elseif c.authority == npcs.all[watcher].clan or
					c.authority == npcs.all[watcher].labelname then
						-- 
						-- intersting here TESTJPF
						-- it might be interesting to add random npc authorities?
						-- or bases on room roles??
						if c.authority == "security" and c.state == "snitch" and c.npc ~= watcher then
							snitch_to_security(c,watcher)
						end
					-- if watcher's clan is authority or clan liked by agent
					elseif (c.state == "merits" and c.npc ~= watcher) and 
					(npcs.all[watcher].clan == c.authority or 
					npcs.all[c.npc].attitudes[npcs.all[watcher].clan] > 0) then
						if c.suspect ~= "player" then
							--apply possible effect to watcher
							local effects_list = {"admirer", "inspired","eagleeye","vanity","readup","yogi","angel"}
							local fx_labels = utils.shuffle(effects_list)
							local effect = utils.deepcopy(fx.all[fx_labels[1]])
							if effect.fx.type == "attitudes" then
								effect.fx.stat = npcs.all[c.suspect].clan 
							end
							print(c.npc, "has found:", watcher,"because of merits caution. now",watcher, "has this effect:", fx_labels[1])

							table.insert(npcs.all[watcher].effects,effect)
							fx.add_effects_bonus(npcs.all[watcher], effect)
						else		
							npcs.all[watcher].love = npcs.all[watcher].love + 1 
						end
					elseif (c.state == "demerits" and c.npc ~= watcher) and 
					(npcs.all[watcher].clan == c.authority or 
					npcs.all[c.npc].attitudes[npcs.all[watcher].clan] > 0) then
						if c.suspect ~= "player" then
							local effects_list = {"prejudice", "boring","distracted","ignorant","lazy","dunce","devil"}
							local fx_labels = utils.shuffle(effects_list)
							local effect = utils.deepcopy(fx.all[fx_labels[1]])
							if effect.fx.type == "attitudes" then
								effect.fx.stat = npcs.all[c.suspect].clan 
							end
							print(c.npc, "has found:", watcher,"because of DEmerits caution. now",watcher, "has this effect:", fx_labels[1])
							
							table.insert(npcs.all[watcher].effects,effect)
							fx.add_effects_bonus(npcs.all[watcher], effect)
						else
							npcs.all[watcher].love = npcs.all[watcher].love - 1 
						end
					end
				end
			end
		end
		c.time = c.time - 1
		if c.time <= 0 then cautions[_] = nil end
		if confront ~= nil  then break end
	end
	return confront
end

return M