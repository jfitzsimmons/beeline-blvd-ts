local chest = require "main.systems.inventorysystem"
local utils = require "main.utils.utils"

local M = {}
local skills = {
	constitution = 5,
	charisma = 5, -- deception?
	wisdom = 5,
	intelligence = 5,
	speed = 5,
	perception = 5,-- insight
	strength = 5, --carrying capacity, intimidation
	stealth = 5-- !!
}
local binaries = {
	evil_good = 0,
	passive_aggressive = 0,
	lawless_lawful = 0,
	anti_authority = 0,
	un_educated = 0,
	poor_wealthy = 0
}
local npc_defaults = {
	convos = 0,
	actions = {"talk", "give", "trade", "pockets"},
	ai_path = "",
	matrix = {x=0, y=0},
	attitudes = {},
	skills = skills,
	binaries = binaries,
	turns_since_encounter = 0,
	love = 0, 
	hp = 5,
	cooldown = 0,
	effects = {},
	currentroom="",
	exitroom="",
	currentstation=""
}

M.order = {}
M.all = {
	["labor01"] = {
		home = {x=1, y=3}, --loading
		labelname = "labor01",
		inventory = {hash("tomato")},
		clearence = 1,
		clan = "labor",
	},
	["labor02"] = {
		home = {x=2, y=2}, --warehouse
		labelname = "labor02",
		inventory = {hash("mushroom03")},
		clearence = 1,
		clan = "labor",
	},
	["labor03"] = {
		home = {x=5, y=2}, --maintenance
		labelname = "labor03",
		inventory = {},
		clearence = 1,
		clan = "labor",
	},
	["labor04"] = {
		home = {x=1, y=6},
		labelname = "labor04",
		inventory = {},
		clearence = 1,
		clan = "labor",
	},
	["doc02"] = {
		home = {x=1, y=5}, 
		labelname = "doc02",
		inventory = {},
		clearence = 1,
		clan = "doctors",
	},
	["doc01"] = {
		home = {x=5, y=5}, 
		labelname = "doc01",
		inventory = {hash("orange")},
		clearence = 1,
		clan = "doctors",
	},
	["contractor02"] = {
		home = { x = 3, y = 3,},
		labelname = "contractor02",
		inventory = {},
		clearence = 0,
		clan = "contractors",
	},
	["contractor01"] = {
		home = { x = 3, y = 5,}, --admin1
		labelname = "contractor01",
		inventory = {hash("earrings")},
		clearence = 0,
		clan = "contractors",
	},
	["visitor02"] = {
		home = { x = 1, y = 5,}, --grounds
		labelname = "visitor02",
		inventory = {hash("mushroom02")},
		clearence = 0,
		clan = "visitors",
	},
	["visitor01"] = {
		home = { x = 3, y = 4,},--lobby
		labelname = "visitor01",
		inventory = {hash("leaf02")},
		clearence = 0,
		clan = "visitors",
	},
	["sexworker01"] = {
		home = { x = 5, y = 4,},--pubgrill
		labelname = "sexworker01",
		inventory = {hash("magicb2")},
		clearence = 1,
		clan = "sexworkers",
	},
	["sexworker02"] = {
		home = { x = 5, y = 3,},--inn
		labelname = "sexworker02",
		inventory = {hash("leaf01")},
		clearence = 0,
		clan = "sexworkers",
	},
	["church01"] = {
		home = { x = 4, y = 3,}, --chapel
		labelname = "church01",
		inventory = {hash("mirror")},
		clearence = 1,
		clan = "church",
	},
	["church02"] = {
		home = { x = 5, y = 5,},--store
		labelname = "church02",
		inventory = {hash("string")},
		clearence = 0,
		clan = "church",
	},
	["eve"] = {
		home = { x = 2, y = 5,}, --reception
		labelname = "eve",
		inventory = {hash("bronze"), hash("glove01")},
		clearence = 1,
		clan = "staff",
	},
	["tyler"] = {
		home = { x = 5, y = 3,},--inn1
		labelname = "tyler",
		inventory = {hash("banana"), hash("cape")},
		clearence = 1,
		clan = "staff",
	},
	["frank"] = {
		home = { x = 5, y = 6,},--dorm
		labelname = "frank",
		inventory = {hash("envelope"), hash("vial01")},
		clearence = 1,
		clan = "staff",
	},
	["staff04"] = {
		home = { x = 5, y = 5,},--store
		labelname = "staff04",
		inventory = {hash("fish01"), hash("gold")},
		clearence = 1,
		clan = "staff",
	},
	["staff05"] = {
		home = { x = 3, y = 1,}, --alley3
		labelname = "staff05",
		inventory = {hash("steak02")},
		clearence = 1,
		clan = "staff",
	},
	["bruiser"] = {
		home = { x = 5, y = 2,},--maint
		labelname = "bruiser",
		inventory = {hash("egg01"), hash("mallot")},
		clearence = 1,
		clan = "gang1",
	},
	["lou"] = {
		home = { x = 2, y = 1,},--alley2
		labelname = "lou",
		inventory = {hash("avacado")},
		clearence = 1,
		clan = "gang1",
	},
	["spike"] = {
		home = { x = 5, y = 4,},
		labelname = "spike",
		inventory = {hash("rose")},
		clearence = 1,
		clan = "gang2",
	},
	["curly"] = {
		home={x=5,y=6},
		labelname = "curly",
		inventory = {hash("berry02")},
		clearence = 1,
		clan = "gang2",
	},
	["gang302"] = {
		home = { x = 1, y = 1,},
		labelname = "gang302",
		inventory = {hash("shrimp02")},
		clearence = 1,
		clan = "gang3",
	},
	["gang301"] = {
		home = { x = 4, y = 4,},
		labelname = "gang301",
		inventory = {hash("magicc5")},
		clearence = 1,
		clan = "gang3",
	},
	["gang402"] = {
		home = { x = 4, y = 5,},
		labelname = "gang402",
		inventory = {hash("fish02"), hash("sunhat")},
		clearence = 1,
		clan = "gang4",
	},
	["gang401"] = {
		home = { x = 5, y = 6,},
		labelname = "gang401",
		inventory = {hash("eyeball02")},
		clearence = 1,
		clan = "gang4",
	},
	["corps02"] = {
		home = { x = 3, y = 5,},--admin1
		labelname = "corps02",
		inventory = {hash("magicb3")},
		clearence = 1,
		clan = "corps",
	},
	["corps01"] = {
		home = { x = 4, y = 6,},--admin2
		labelname = "corps01",
		inventory = {hash("sack")},
		clearence = 1,
		clan = "corps",
	},
	["corps03"] = {
		home = { x = 2, y = 6,},--vip
		labelname = "corps03",
		inventory = {hash("magica4")},
		clearence = 1,
		clan = "corps",
	},
	["security001"] = {
		home = { x = 2, y = 4,},--customs
		labelname = "security001",
		inventory = {hash("potion")},
		clearence = 1,
		clan = "security",
	},
	["security002"] = {
		matrix = {x=3, y=6},
		home = { x = 1, y = 4,},--baggage
		labelname = "security002",
		inventory = {hash("ring")},
		clearence = 1,
		clan = "security",
	},
	["security003"] = {
		home = { x = 5, y = 5,},--store
		labelname = "security003",
		inventory = {hash("drumstick01")},
		clearence = 2,
		clan = "security",
	},
	["security004"] = {
		home = { x = 5, y = 2,},--maint
		labelname = "security004",
		inventory = {hash("coffeemug")},
		clearence = 2,
		clan = "security",
	}
}

M.ais = {		
	["fredai"] = {
		labelname = "fredai",
		inventory = {},
		actions = {"talk", "use"},
		clan = "ais",
		clearence = 1,
		ai_path = "",
		matrix = {x=0, y=0},
		skills = {},
		binaries = {},
	}
}

local binarylookup = {
	ais = {
		evil_good = .3,
		passive_aggressive = -.3,
		lawless_lawful = .2,
		anti_authority = -.2,
		un_educated = 0,
		poor_wealthy = -.1,
	},
	church = {
		evil_good = 0,
		passive_aggressive = -.1,
		lawless_lawful = 0.1,
		anti_authority = 0.2,
		un_educated = -0.3,
		poor_wealthy = 0.1,
	},
	contractors = {
		evil_good = 0.1,
		passive_aggressive = -0.1,
		lawless_lawful = 0.1,
		anti_authority = 0.1,
		un_educated = 0.3,
		poor_wealthy = 0.2,
	},
	corps = {
		evil_good = -0.3,
		passive_aggressive = 0.1,
		lawless_lawful = 0,
		anti_authority = -0.1,
		un_educated = 0.2,
		poor_wealthy = 0.3,
	},
	gang1 = {
		evil_good = -0.2,
		passive_aggressive = 0.3,
		lawless_lawful = -0.2,
		anti_authority = 0.1,
		un_educated = -0.2,
		poor_wealthy = -0.1,
	},
	gang2 = {
		evil_good = -0.2,
		passive_aggressive = 0,
		lawless_lawful = -0.1,
		anti_authority = -0.1,
		un_educated = -0.2,
		poor_wealthy = 0.2,
	},
	gang3 = {
		evil_good = -0.1,
		passive_aggressive = 0.2,
		lawless_lawful = -0.3,
		anti_authority = 0.2,
		un_educated = -0.1,
		poor_wealthy = 0,
	},
	gang4 = {
		evil_good = 0.1,
		passive_aggressive = 0.1,
		lawless_lawful = -0.1,
		anti_authority = -0.2,
		un_educated = 0.2,
		poor_wealthy = -0.2,
	},
	labor = {
		evil_good = 0.2,
		passive_aggressive = -0.2,
		lawless_lawful = 0.2,
		anti_authority = -0.3,
		un_educated = -0.1,
		poor_wealthy = -0.3,
	},
	security = {
		evil_good = -0.1,
		passive_aggressive = 0.2,
		lawless_lawful = -0.2,
		anti_authority = 0.3,
		un_educated = -0.1,
		poor_wealthy = 0.1,
	},
	staff = {
		evil_good = 0.2,
		passive_aggressive = 0,
		lawless_lawful = -0.2,
		anti_authority = 0,
		un_educated = 0.1,
		poor_wealthy = -0.2,
	},
	visitors = {
		evil_good = 0,
		passive_aggressive = 0,
		lawless_lawful = 0,
		anti_authority = 0,
		un_educated = 0,
		poor_wealthy = 0,
	},
	sexworkers = {
		evil_good = 0,
		passive_aggressive = 0,
		lawless_lawful = 0,
		anti_authority = -0.1,
		un_educated = -0.1,
		poor_wealthy = -0.1,
	},
	doctors = {
		evil_good = 0,
		passive_aggressive = 0,
		lawless_lawful = 0.1,
		anti_authority = 0,
		un_educated = 0.1,
		poor_wealthy = 0.1,
	},
}

local function adjust_binaries(value, clan, binary)
	local adj = binarylookup[clan][binary] + value +  ( math.random(-4, 4) / 10 )
	if adj > 1 then adj = 1 
	elseif adj < -1 then adj = -1 end

	return adj
end

local function random_attributes(npc)
	local ai_paths = { "inky", "blinky", "pinky", "clyde" }
	local startskills = { 1,2,3,5,7,7,8,8 }
	local startbins = {-1, -.5, -0.1, 0.1, .5, 1}
	local path = 1
	local _defaults = utils.deepcopy(npc_defaults)
	
	for dk,dv in pairs(_defaults) do
		M.all[npc][dk] = dv
	end

	M.all[npc].turns_since_encounter = math.random(5,15)
	M.all[npc].love = math.random(-1,1)
	
	-- random attitudes
	for clan,cv in pairs(binarylookup) do
		M.all[npc].attitudes[clan] = math.random(-9, 9) 
	end

	if path > 4 then path = 1 end
	M.all[npc].ai_path = ai_paths[path]
	path = path + 1

	-- random skills
	local tempskills = utils.shuffle(startskills)
	local s_count = 1
	for ks,vs in pairs(skills) do
		M.all[npc].skills[ks] = tempskills[s_count] + math.random(-1, 1)
		s_count = s_count + 1
	end
	
	-- random binaries
	local tempbins = utils.shuffle(startbins)
	local b_count = 1
	for ks,vs in pairs(binaries) do
		local adjustment = adjust_binaries(tempbins[b_count],M.all[npc].clan,ks)
		M.all[npc].binaries[ks] = adjustment 
		b_count = b_count + 1
	end	

	-- inventory bonuses
	for _,iv in pairs(M.all[npc].inventory) do
		chest.add_chest_bonus(M.all[npc], iv)
	end
	
end

function M.new_npcs_state()
	local count = 1
	for _,npc in pairs(M.all) do
		M.order[count] = npc.labelname
		random_attributes(npc.labelname)
		count = count + 1
	end
end

function M.return_doctors()
	return {
		M.all.doc01,
		M.all.doc02
	}
end

function M.return_all()
	return M.all
end

return M