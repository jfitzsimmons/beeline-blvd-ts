local taskstates = require "main.states.taskstates"
local utils = require "main.utils.utils"
local chest = require "main.systems.inventorysystem"
local fx = require "main.systems.effectsystem"

local M = {}

local function confrontation_consequence(p, n)
	--ugly code. testjpf.  not many cautions needed.  
	--returns are superflous
	if n.binaries.passive_aggressive > 0.0 and n.skills.wisdom < 5 and n.skills.strength >= p.skills.speed then
		print("CC:: n punches p")--n punches p
		p.hp = p.hp -1
		return "nothing"
	elseif p.skills.charisma > 5 and n.skills.intelligence < 5 and p.binaries.evil_good < -0.2 then
		-- makes next person n meets like p's clan
		print("CC:: vanity")
		local effect = utils.deepcopy(fx.all.vanity)
		table.insert(n.effects,effect) -- lawfulness increase? 
		fx.add_effects_bonus(n, effect)
		return "nothing"
	elseif p.skills.wisdom > 6 and n.skills.wisdom > 5 and p.binaries.evil_good + n.binaries.evil_good > 0.3 then
		-- makes next person n meets like their clan
		print("CC:: angel")
		local effect = utils.deepcopy(fx.all.angel)
		table.insert(n.effects,effect) -- lawfulness increase? 
		fx.add_effects_bonus(n, effect)
		return "nothing" 
	elseif p.binaries.passive_aggressive > 0.5 and p.skills.wisdom < 4 and p.skills.strength >= n.skills.speed then
		-- p punches n
		print("CC:: p punches n")
		n.hp = n.hp -1
		--testjpf this should rais and ASSAULT caution!!
		return "nothing" 
	elseif p.skills.charisma < 5 and n.skills.perception > 5 and n.binaries.passive_aggressive < -0.2 then
		-- makes next person n meets hate p's clan
		print("CC:: prejudice")
		local effect = utils.deepcopy(fx.all.prejudice)
		effect.fx.stat = p.clan
		table.insert(n.effects,effect) -- lawfulness increase? 
		fx.add_effects_bonus(n, effect)
		return "nothing" 
	elseif p.binaries.anti_authority > 0 and n.skills.stealth > 3 and n.binaries.lawless_lawful > 0.2 then
		print("CC:: snitch")
		-- snitch
		-- makes next person n meets hate p's clan
		return "snitch" 
	elseif math.random() < 0.5 then 
		print("CC:: unlucky???")
		return "nothing"
	end

	if p.labelname ~= "adam" then
		local caution = taskstates.consulation_checks(n.binaries,n.skills)
		if caution ~= "neutral" then
			taskstates.caution_builder(n, caution, p.labelname, "theft")
			print("CONFRONTATION_consequence: stole item, confronted, keeps item, recieved caution:", caution)
		else
			print("CONFRONTATION_consequence: no fx or cautions")
		end
	else	
		n.love = n.love - 1
	end

	return "neutral"
end

function M.take_check(taker, actor)
	-- testjpf if you hae a cooldown, it greatly increases your chances??
	-- then make default chance lower
	local chances = math.random() + ((1 - #taker.inventory - taker.cooldown) * 0.1)
	if taskstates.npc_has_caution("any", taker.labelname) ~= nil then chances = chances - 0.1 end

	local minmax = utils.dice_roll()
	--print("chances:",chances,"TAKE CHECK dicE:",minmax[1]*10,minmax[2]*10)
	--print((taker.skills.speed + taker.skills.stealth + (taker.binaries.poor_wealthy * -10)) /2)
	local take = false
	--print("(taker.skills.speed + taker.skills.stealth + (taker.binaries.poor_wealthy * -10)) /9 = ",(taker.skills.speed + taker.skills.stealth + (taker.binaries.poor_wealthy * -10)) /9)
	if chances > 0.5 then
		-- advantage
		if minmax[1] * 10 <  (taker.skills.speed + taker.skills.stealth + (taker.binaries.poor_wealthy * -10)) /9 then print("take adv") take = true end
	else
		--disadvantage
		if minmax[2] * 10 <  (taker.skills.speed + taker.skills.stealth + (taker.binaries.poor_wealthy * -10)) /9 then print("take DISadv") take = true end
	end

	if take == true then
		local chest_item = nil
		if math.random() < 0.5 then
			chest_item = chest.remove_valuable(taker.inventory, actor.inventory)
		elseif math.random() < 0.5 then
			chest_item = chest.remove_advantageous(taker.inventory, actor.inventory, taker.skills)
		else
			chest_item = chest.remove_random(taker.inventory, actor.inventory)
		end
		chest.add_chest_bonus(taker, chest_item)

		print(taker.labelname, "TOOK an item")
	else
		print(taker.labelname, "failed to Take")
	end
end

function M.stash_check(stasher, actor)
	-- testjpf if you hae a cooldown, it greatly increases your chances??
	-- then make default chance lower
	local chances = math.random() + ((#stasher.inventory - 2) * 0.1) + (stasher.cooldown/2 * 0.1)
	if taskstates.npc_has_caution("any", stasher.labelname) ~= nil then chances = chances + 0.1 end

	local minmax = utils.dice_roll()
	--print("chances:",chances,"stash_check dicE:",minmax[1]*10,minmax[2]*10)
	--print("(stasher.skills.constitution + stasher.skills.stealth + (stasher.binaries.anti_authority * -10)) /5 =",(stasher.skills.constitution + stasher.skills.stealth + (stasher.binaries.anti_authority * -10)) /5)
	local stash = false
	if chances > 0.5 then
		-- advantage
		if minmax[1] * 10 <  (stasher.skills.constitution + stasher.skills.stealth + (stasher.binaries.anti_authority * -10)) /5 then print("stash adv") stash = true end
	else
		--disadvantage
		if minmax[2] * 10 <  (stasher.skills.constitution + stasher.skills.stealth + (stasher.binaries.anti_authority * -10)) /5 then print("stash DISadv") stash = true end
	end

	if stash == true then
		local chest_item = nil
		-- testjpf would need watcher for victim and more checks
		-- local victim = utils.has_value(w.inventory, a[1])
		if math.random() < 0.5 then
			chest_item = chest.remove_valuable(actor.inventory, stasher.inventory)
		elseif math.random() < 0.5 then
			chest_item = chest.remove_advantageous(actor.inventory, stasher.inventory, stasher.skills)
		else
			chest_item = chest.remove_last(actor.inventory, stasher.inventory)
		end
		chest.remove_chest_bonus(stasher, chest_item)
		-- if victim == true then chest.add_chest_bonus(n, chest_item) end

		print(stasher.labelname, "STASHED an item")
	else
		print(stasher.labelname, "failed to stash")
	end
end

function M.take_or_stash(attendant,actor)
	if #actor.inventory > 0  and math.random() < 0.5 then
		M.take_check(attendant,actor)	
	elseif #attendant.inventory > 0 and math.random() < 0.66 then	
		M.stash_check(attendant,actor) 
	end
end

function M.seen_check(p, n)
	local minmax = utils.dice_roll()
	--testjpf these are high odds you'll be seen
	-- as inteded???
	if p.stealth <= n.stealth or p.stealth <= n.perception then
		if minmax[1] * 10 <  (n.perception + n.stealth + n.speed) /2 then return true end
	else
		if minmax[2] * 10 <  (n.perception + n.stealth + n.speed) /2 then return true end
	end

	return false
end

function M.confrontation_check(p, n)
	-- testjpf for debugging you could check if player return false
	if p.labelname == "adam" then return false end
	local minmax = utils.dice_roll()
	if n.binaries.passive_aggressive > -0.4 or n.binaries.lawless_lawful > -0.4 then 
		-- p slower or NPC willing p is caught
		if p.skills.speed < n.skills.speed or p.skills.speed < n.skills.constitution then
			-- check for confrontation with DISADVANTAGE
			if minmax[1] * 9 <  (n.skills.speed + n.skills.constitution)/1.6 then
				print("Caught: too slow") 
				return true
			end
		else
			-- check for confrontation with ADVANTAGE
			if minmax[2] * 10 <  (n.skills.speed + n.skills.constitution)/1.8 then
				print("Caught: fast, but unlucky") 
				return true
			end
		end
	end
	print(n.labelname, "did not confront: ", p.labelname) 
	return false
end

--testjpf only being used between npcs (just tutorial luggage)
function M.steal_check(n,w,a)
	local consequence = "neutral"

	if n.cooldown <= 0 and
	(n.binaries.un_educated < -0.5 and 
	n.skills.speed > 4) or
	(n.binaries.lawless_lawful < 0.5 and 
	n.skills.stealth > 2) or
	(n.binaries.evil_good < -0.5 and 
	n.love < -5) and
	(n.binaries.poor_wealthy < -0.5 and 
	n.skills.stealth > 4) or
	(n.skills.perception < 4 and 
	n.skills.constitution < 4) or
	(n.skills.speed > 6 and w ~= nil and n.attitudes[w.clan] < -3) then
		if w ~= nil and M.seen_check(n.skills, w.skills) == true then 
			print("steal attempt -",n.labelname," SEEN by:", w.labelname, "in", w.currentroom )
			if M.confrontation_check(n, w) == true then
				consequence = confrontation_consequence(n, w)
			else
				consequence = taskstates.consulation_checks(w.binaries,w.skills)
			end
		else
			if math.random() < 0.6 then 
				consequence = "nothing" 
				if w ~= nil then
					print("steal attempt -",n.labelname,"was UNSEEN but FAILED by:", w.labelname, "in", w.currentroom )
				else
					print("steal attempt -",n.labelname,"was UNSEEN but FAILED no WATCHER", n.currentroom )
				end

			else
				if w ~= nil then
					print("STEAL attempt PASS-",n.labelname,"was UNSEEN by:", w.labelname, "in", w.currentroom )
				else
					print("STEAL attempt PASS-",n.labelname,"was UNSEEN no WATCHER", n.currentroom )
				end
			end
		end

		if consequence == "neutral" then
			local chest_item = nil
			local victim = false 
			--if w ~= nil then utils.has_value(w.inventory, a[1]) end
			print(n.labelname,"in room",n.currentroom, "stole following item:" )
			if math.random() < 0.5 then
				chest_item = chest.remove_random(n.inventory,a)
			elseif math.random() < 0.5 then
				chest_item = chest.remove_valuable(n.inventory,a)
			else
				chest_item = chest.remove_advantageous(n.inventory, a, n.skills)
			end
			chest.add_chest_bonus(n, chest_item)
			if victim == true then chest.remove_chest_bonus(w, chest_item) end
			n.cooldown = math.random(5,15)
		elseif consequence ~= "nothing" then
			if w ~= nil then taskstates.caution_builder(w, consequence, n.labelname) end
		else
			print("UNSEEN FAIL??? NO ATTEMPT??? CC:: ALL NOTHINGS???"," TESTJPF")
		end

		n.cooldown = n.cooldown + 8
	else
		print("No attempt by", n.labelname)
	end

end



return M