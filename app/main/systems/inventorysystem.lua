local utils = require "main.utils.utils"

local M = {}

M.items = {
	magica1 = {
		value = 2,
		level = 1,
		bins = {
			anti_authority = -0.1,
			evil_good = 0.1,
		},
		skills = {}
	},
	feather01 = {
		value = 1,
		level = 1,
		bins = {
			anti_authority = -0.1,
		},
		skills = {
			speed = 1
		}
	},
	berry01 = {
		value = 2,
		level = 1,
		bins = {
			anti_authority = 0.1,
		},
		skills = {
			wisdom = -1
		}
	},
	drumstick01 = {
		value = 3,
		level = 1,
		bins = {
			anti_authority = -0.2,
		},
		skills = {
			speed = -2
		}
	},
	magica4 = {
		value = 4,
		level = 1,
		bins = {
			evil_good = 0.3,
		},
		skills = {}
	},
	magicb3 = {
		value = 4,
		level = 1,
		bins = {
			evil_good = -0.3,
		},
		skills = {}
	},
	magicb1 = {
		value = 3,
		level = 1,
		bins = {
			evil_good = -0.1,
		},
		skills = {}
	},
	feather02 = {
		value = 2,
		level = 1,
		bins = {
			anti_authority = -0.1,
		},
		skills = {}
	},
	eyeball02 = {
		value = 2,
		level = 1,
		bins = {
			lawless_lawful = -0.2,
		},
		skills = {}
	},
	eyeball03 = {
		value = 3,
		level = 1,
		bins = {
			lawless_lawful = -0.3,
		},
		skills = {
			perception = 1
		}
	},
	drumstick01 = {
		value = 3,
		level = 1,
		bins = {
			anti_authority = -0.2,
		},
		skills = {
			speed = -2
		}
	},
	sunhat = {
		value = 3,
		level = 1,
		bins = {
			passive_aggressive = -0.2,
		},
		skills = {}
	},
	magicc5 = {
		value = 3,
		level = 1,
		bins = {
			evil_good = 0.1,
		},
		skills = {}
	},
	shrimp02 = {
		value = 3,
		level = 1,
		bins = {
			poor_wealthy = 0.1,
		},
		skills = {
			charisma = -1
		}
	},
	avacado = {
		value = 3,
		level = 1,
		bins = {
			anti_authority = -0.1,
		},
		skills = {
			charisma = 1
		}
	},
	gold = {
		value = 10,
		level = 1,
		bins = {
			poor_wealthy = 0.4,
		},
		skills = {}
	},
	gold = {
		value = 10,
		level = 1,
		bins = {
			poor_wealthy = 0.4,
		},
		skills = {}
	},
	cape = {
		value = 4,
		level = 1,
		bins = {
			evil_good = -0.1,
		},
		skills = {}
	},
	glove01 = {
		value = 3,
		level = 1,
		bins = {
			passive_aggressive = 0.1,
		},
		skills = {}
	},
	banana = {
		value = 2,
		level = 1,
		bins = {
			un_educated = -0.1,
		},
		skills = {}
	},
	string = {
		value = 1,
		level = 1,
		bins = {
			un_educated = 0.1,
		},
		skills = {}
	},
	mirror = {
		value = 1,
		level = 1,
		bins = {},
		skills = {
			perception = -1,
		}
	},
	leaf03 = {
		value = 1,
		level = 1,
		bins = {
			poor_wealthy = -0.1
		},
		skills = {
			stealth = -1,
		}
	},
	leaf01 = {
		value = 1,
		level = 1,
		bins = {},
		skills = {
			stealth = -1,
		}
	},
	magicb2 = {
		value = 3,
		level = 1,
		bins = {
			evil_good = -0.1,
		},
		skills = {},
	},
	leaf02 = {
		value = 1,
		level = 1,
		bins = {},
		skills = {
			stealth = -2,
		}
	},
	mushroom02 = {
		value = 4,
		level = 1,
		bins = {},
		skills = {
			wisdom = 2,
			intelligence = -2,
		}
	},
	orange = {
		value = 2,
		level = 1,
		bins = {},
		skills = {
			constitution = 1,
		}
	},
	mushroom03 = {
		value = 5,
		level = 1,
		bins = {},
		skills = {
			wisdom = 3,
			intelligence = -3,
		}
	},
	tomato = {
		value = 2,
		level = 1,
		bins = {},
		skills = {
			perception = 1,
		}
	},
	axe = {
		value = 5,
		level = 1,
		bins = {},
		skills = {
			constitution = 1,
			speed = -1
		}
	},
	ring = {
		value = 8,
		level = 1,
		bins = {},
		skills = {
			wisdom = 1,
			constitution = -1
		}
	},
	bronze = {
		value = 6,
		level = 1,
		bins = {},
		skills = {
			wisdom = 1,
			constitution = -1
		}
	},
	potion = {
		value = 5,
		level = 1,
		bins = {},
		skills = {
			charisma = 1,
			strength = -1
		}
	},
	berry02 = {
		value = 3,
		level = 1,
		bins = {},
		skills = {
			strength = 1,
			wisdom = -1
		}
	},
	egg01 = {
		value = 2,
		level = 1,
		bins = {},
		skills = {
			stealth = 1,
			speed = -1
		}
	},
	envelope = {
		value = 1,
		level = 1,
		bins = {},
		skills = {
			perception = 1,
			charisma = -1
		}
	},
	vial01 = {
		value = 2,
		level = 1,
		bins = {},
		skills = {
			intelligence = 1,
			stealth = -1
		}
	},
	vial02 = {
		value = 7,
		level = 1,
		bins = {
			un_educated = 0.2
		},
		skills = {
			intelligence = 2,
			constitution = 2,
		}
	},
	fish01 = {
		value = 3,
		level = 1,
		bins = {},
		skills = {
			charisma = -1,
			strength = 1
		}
	},
	shears = {
		value = 4,
		level = 1,
		bins = {},
		skills = {
			speed = -1,
			perception = 1
		}
	},
	cheese = {
		value = 2,
		level = 1,
		bins = {},
		skills = {
			constitution = -1,
		}
	},
	pillow = {
		value = 2,
		level = 2,
		bins = {},
		skills = {
			strength = -3,
			stealth = 3
		}
	},
	steak01 = {
		value = 3,
		level = 2,
		bins = {},
		skills = {
			perception = -1,
			constitution = 1,
		}
	},
	steak02 = {
		value = 4,
		level = 2,
		bins = {},
		skills = {
			perception = -3,
			constitution = 3,
		}
	},
	shrimp01 = {
		value = 4,
		level = 2,
		bins = {},
		skills = {
			wisdom = -3,
		}
	},
	daisy = {
		value = 4,
		level = 2,
		bins = {
			passive_aggressive = -0.2
		},
		skills = {
			wisdom = 2,
		}
	},
	earrings = {
		value = 9,
		level = 2,
		bins = {},
		skills = {
			stealth = -3,
			charisma = 3
		}
	},
	coingold = {
		value = 10,
		level = 1,
		bins = {},
		skills = {
			intelligence = -1,
			wisdom =1
		}
	},
	book = {
		value = 5,
		level = 1,
		bins = {},
		skills = {
			intelligence = 1,
		}
	},
	rose = {
		value = 6,
		level = 1,
		bins = {},
		skills = {
			charisma = 1,
		}
	},
	coffeemug = {
		value = 2,
		level = 1,
		bins = {},
		skills = {
			speed = 1,
			perception = -1
		}
	},
	mallot = {
		value = 4,
		level = 1,
		bins = {},
		skills = {
			strength = 1,
			wisdom = -1
		}
	},
	apple = {
		value = 2,
		level = 1,
		bins = {},
		skills = {
			constitution = 1,
		}
	},
	mushroom01 = {
		value = 1,
		level = 1,
		bins = {},
		skills = {
			wisdom = 1,
			strength = -1
		}
	},
	sack = {
		value = 1,
		level = 1,
		bins = {},
		skills = {
			stealth = 1,
			speed = -1
		}
	},
	eyeball01 = {
		value = 0,
		level = 1,
		bins = {},
		skills = {
			perception = 1,
			charisma = -1
		}
	},
	fish02 = {
		value = 2,
		level = 1,
		bins = {},
		skills = {
			stealth = -2,
		},
		bins = {
			passive_aggressive = 0.2,
		}
	},
	note = {
		value = 2,
		level = 1,
		bins = {},
		skills = {
			charisma = 1,
		},
		bins = {
			evil_good = 0.1,
		}
	},
	apple01 = {
		value = 2,
		level = 1,
		bins = {},
		skills = {
			intelligence = 1,
		},
		bins = {
			anti_authority = 0.1,
		}
	}
}

--testjpf may need a binaries_chest_bonus()
function M.remove_chest_bonus(actor, i)
	for skill,value in pairs(M.items[i].skills) do
		actor.skills[skill] = actor.skills[skill] - value
	end
	for bin,value in pairs(M.items[i].bins) do
		actor.binaries[bin] = actor.binaries[bin] - value
	end
end

function M.add_chest_bonus(actor, i)
	for skill,value in pairs(M.items[i].skills) do
		actor.skills[skill] = actor.skills[skill] + value
	end
	for bin,value in pairs(M.items[i].bins) do
		actor.binaries[bin] = actor.binaries[bin] + value
	end
end

function M.remove_random(to_inv,from_inv)
	local stolen_item = table.remove(utils.shuffle(from_inv),1)
	print("remove_ random",stolen_item)
	table.insert(to_inv,stolen_item)
	return stolen_item
end

function M.remove_last(to_inv,from_inv)
	local item = table.remove(from_inv,#from_inv)
	print("remove_ last",item)
	table.insert(to_inv,item)
	return item
end

function M.remove_advantageous(to_inv, from_inv, skills)
	local order = utils.create_ipairs(skills)
	table.sort(order, function(a, b) return skills[a] > skills[b] end)
	local found = false
	local stolen_item = ""
	for _, sv in ipairs(order) do
		for ik, iv in pairs(from_inv) do
			for isk, isv in pairs(M.items[iv].skills) do
				if isv > 0 and isk == sv then
					stolen_item = table.remove(from_inv,1)
					table.insert(to_inv,stolen_item)
					found = true 
					break
				end
				if found == true then break end
			end
			if found == true then break end
		end
		if found == true then break end
	end
	if found == false then 
		stolen_item = table.remove(from_inv,#from_inv)
		print("remove_ advFALLBACK",stolen_item)
		table.insert(to_inv,stolen_item)
	end
	return stolen_item
end

function M.remove_valuable(to_inv,from_inv)
	--[[
	for _, iv in ipairs(from_inv) do
		print("iv:",iv)
		print("M.items[iv].value:",M.items[iv].value)
	end
	]]--
	if #from_inv > 1 then 
		table.sort(from_inv, function(x, y) return M.items[x].value > M.items[y].value end)
	end
	local stolen_item = table.remove(from_inv,1)
	print("remove_ valueable",stolen_item)
	table.insert(to_inv,stolen_item)
	return stolen_item
end

return M