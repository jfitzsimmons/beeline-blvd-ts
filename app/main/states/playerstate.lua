local utils = require "main.utils.utils"

local M = {}
local testvalues = { 1,1,3,4,5,6,6,7 }
local default_state = {
	currentroom = "grounds",
	exitroom = "",
	matrix = { x = 1, y = 5,},
	name = hash("/adam"),
	labelname = "adam",
	inventory = {hash("axe"),hash("apple01")},
	pos = {x=704,y=448},
	levels_cleared = 0,
	alert_level = 0,
	hp = 3,
	ap_max = 18,
	ap = 18,
	turns = 0,
	checkpoint = "tutorialA",
	binaries = {
		evil_good = 0,
		passive_aggressive = 0,
		lawless_lawful = 0,
		anti_authority = 0,
		un_educated = 0,
		poor_wealthy = 0,
		
	},
	skills = {
		constitution = 5,
		charisma = 5, -- deception?
		wisdom = 5,
		intelligence = 5,
		speed = 5,
		perception = 5,-- insight
		strength = 5, --carrying capacity, intimidation
		stealth = 5-- !!
	},
	effects = {}
}

local function random_skills()
	local tempvals = utils.shuffle(testvalues)
	local count = 1
	for k,v in pairs(M.state.skills) do
		M.state.skills[k] = tempvals[count] + math.random(-1, 1)
		count = count + 1
	end	
end

M.state = utils.deepcopy(default_state)

function M.return_inventory()
	return M.state.inventory
end

function M.return_skills()
	return M.state.skills
end

function M.new_player_state()
	M.state = utils.deepcopy(default_state)
	random_skills()
end

return M