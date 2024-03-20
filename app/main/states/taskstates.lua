local utils = require "main.utils.utils"
local tutorialquests = require "main.states.quests.tutorialstate"

local caution= "neutral"
local failure = false

-- could have taks call "favors"
--and a state of "favors"
-- could see if npc own a caution you could help with?
-- suspect of a caution?
-- where could randomly pick types of favors?
-- get an item
-- piss off an npc
-- hurt someone
-- frame someone
-- ruin reputation
-- rob someone
--lvl2: get someone kicked out 

local function favor(bins,skills)
	--testjpf I think that enough successful favors/blackmail scenarios
	--then you get a "recruit/initiate task'
	if (bins.evil_good < -.5 or bins.lawless_lawful < -.5) and failure == false  then --blackmail ultimatum
		print("blackmail")
		caution= "blackmail"
		failure = true 
		--testjpf what are you blackmailing
		-- the difference between some is:
		--does it involve a quest?
		--security, clan, specific npc, physical harm, rumor
		--involves quest


		-- if it meets one of the quest "THRESHOLDS" then offer quest
		-- if not threaten with "Punitive" action??? (probably a CAUTION)
	elseif (bins.evil_good > .5  or skills.wisdom > 5) and failure == false  then --bonding favor
		print("ask a favor")
		caution= "favor"
		failure = true 
		--slander, demerits, will gossip
		--involves quest
	else
		failure = false
	end
	return {fail = failure, caution = caution}
end

local function snitch(bins,skills)
	if bins.anti_authority > -.7 and failure == false  then --tell authority they have good attitude towards
		caution= "snitch"
		failure = true 
		--security, clan, specific npc tell them what you did.
	else
		failure = false
	end
	return {fail = failure, caution = caution}
end

local function question(bins,skills)	
	if bins.anti_authority > .5 and failure == false  then --tell authority they have good attitude towards
		caution= "snitch"
		failure = true 
		--security, clan, specific npc tell them what you did.
	else
		failure = false
	end
	return {fail = failure, caution = caution}
end

local function slander(bins,skills)
	-- slander you to people close to them / who like them / they like / cohort with

	return {fail = failure, caution = caution}
end

local function merits(bins,skills)
	if bins.evil_good < -.2 and bins.lawless_lawful < -.2 and failure == false  then
		caution= "merits"
		failure = true 
	elseif bins.passive_aggressive < -.3 or skills.constitution < 4 and failure == false  then 
		caution= "demerits"
		failure = true 
		--won't like you,
		-- slander you to people close to them / who like them / they like / cohort with
		-- decreases others love for player
	else
		failure = false
	end
	return {fail = failure, caution = caution}
end

local function quest(bins,skills)
	--testjpf check for love states,attitudes,
	--test against ""Quest_COnditions"???
	if (bins.anti_authority < -.5  or bins.poor_wealthy < -.5) and failure == false  then --underdog task
		--testjpf this is vague.  
		--thought was maybe you'de be accepted by entire clan??  
		-- This is a level up quest. Ex:
		-- security clearence upgrade, temporary immune to security, 
		-- immediate changing of attitude of clan
		-- disabling of systems, BIG STUFF, etc...
		caution= "quest"
		failure = true 
	else
		failure = false
	end
	return {fail = failure, caution = caution}
end

local function reckless(bins,skills)
	--testjpf was -.5 , 4
	if (bins.un_educated < -0.4 or skills.intelligence < 4) and failure == false  then --underdog task
		caution= "reckless"
		failure = true 
		-- will tell whoever what they saw
		-- they might like it or hate it
	else
		failure = false
	end
	return {fail = failure, caution = caution}
end

local function promote(bins,skills)
	--they like what you did and tell others who would like what you did

	return {fail = failure, caution = caution}
end

local M = {}

M.quests = {
	tutorial = tutorialquests.quests
}
--[[
caution = {
	npc
	time = 0,
	state ="neutral",
	type ="clan",
	authority ="security",
	suspect ="player",
	reason = "thesft"
},
]]--
M.cautions = {}
M.consolations = {
	--favor,
	snitch,
	merits,
	--quest,
	reckless
}
--with secrets for ex::
-- talk to desk in reception
-- sk about head of customs.
-- they choose Security004 read there stats and go:::
--"He hates laborers, un_educated people and those with low charisma"
-- could see if npc own a caution you could get info from?
-- i saw church002 steal something
M.secrets = {

}
--testjpf in game: you could use hints from npcs 
-- based on which conditions are and arent met
-- Ex: "Frank figured out how to make key cards."
-- Ex: "Always helps to have a friend in the Church"
-- Ex: "I've been looking a while to bust Labor003 for stealing that diamond"
local function reset_quests()
	local checkpoints = M.quests
	for ck,cv in pairs(checkpoints) do
		for qk,qv in pairs(cv) do
			if qv.passed == true then
				qv.passed = false
			end
			for _,cv in pairs(qv.conditions) do 
				if cv.passed == true then
					cv.passed = false
				end
			end
		end
	end
end

--testjpf have more funcitons like has_snitch() -- no dupe cautions
-- has_reason() --history of "theft"

function M.remove_heat(sus) 
	for _,c in pairs(M.cautions) do
		print("c.npc:", c.npc, "c.reason:", c.reason,"c.state:", c.state, "c.suspect:", c.suspect)
		if c.suspect == sus and (c.state == "questioning" or c.state == "arrest" or c.state == "snitch") then
			print("TRUE TRUE TRUE")
			M.cautions[_] = nil
		end
	end
end

function M.already_hunting(npc, sus) 
	for _,c in pairs(M.cautions) do
		--print("c.npc:", c.npc, "c.reason:", c.reason,"c.state:", c.state, "c.suspect:", c.suspect)
		if c.npc == npc and c.suspect == sus and (c.state == "questioning" or c.state == "arrest") then return c end
	end
	return nil
end

function M.plan_on_snitching(npc, sus) 
	for _,c in pairs(M.cautions) do
		--print("c.npc:", c.npc, "c.reason:", c.reason,"c.state:", c.state, "c.suspect:", c.suspect)
		if c.npc == npc and c.suspect == sus and c.state == "snitch" then return true end
	end
	return false
end

function M.npc_has_caution(npc, sus) 
	for _,c in pairs(M.cautions) do
		--print("c.npc:", c.npc, "c.reason:", c.reason,"c.state:", c.state, "c.suspect:", c.suspect)
		if (npc == "any" or c.npc == npc) and c.suspect == sus then return c end
	end
	return nil
end

function M.append_caution(caution) 
	table.insert(M.cautions, caution)
end

function M.consulation_checks(b,s)
	local tempcons = utils.shuffle(M.consolations)
	for k,v in pairs(tempcons) do
		local check = v(b,s)
		if check.fail == true then 
			return check.caution
		end
	end
	print("did nothing after witnessing a theft attempt")
	return "neutral"
end

function M.caution_builder(n,c,s,r)
	--testjpfm something like:
	-- local reason = "theft"
	local append = {	
		npc= n.labelname,
		time = 15,
		state = c, -- merits --testjpf state is a bad name
		type ="npc",
		authority =n.clan, --ex; labor
		suspect = s,
		reason = r or "theft"
	}
	--testjpf this is getting bad.  cleanup code
	if c == "snitch" then
		append.authority = "security"
		append.type = "clan"
		if c.suspect == "player" then 
			world.player.alert_level = world.player.alert_level + 1 
		end
	elseif c == "merits" then
		if c.suspect == "player" then n.love = n.love + 1 end
		append.time = 3
	elseif c == "demerits" then
		if c.suspect == "player" then n.love = n.love - 1 end
		append.time = 3
	elseif c == "reckless" then
		append.suspect = s
		append.time = 3
	end

	print(append.npc, "know that", append.suspect, "did", append.reason, "so created caution:", append.state)


	M.append_caution(append)
end

function M.new_task_state()
	reset_quests()
	M.cautions = {}
end

return M