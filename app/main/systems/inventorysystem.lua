local utils = require "main.utils.utils"

local M = {}

M.items = {
	[hash("magica1")] = {
		value = 2,
		level = 1,
		bins = {
			anti_authority = -0.1,
			evil_good = 0.1,
		},
		skills = {}
	},
	[hash("feather01")] = {
		value = 1,
		level = 1,
		bins = {
			anti_authority = -0.1,
		},
		skills = {
			speed = 1
		}
	},
	[hash("berry01")] = {
		value = 2,
		level = 1,
		bins = {
			anti_authority = 0.1,
		},
		skills = {
			wisdom = -1
		}
	},
	[hash("drumstick01")] = {
		value = 3,
		level = 1,
		bins = {
			anti_authority = -0.2,
		},
		skills = {
			speed = -2
		}
	},
	[hash("magica4")] = {
		value = 4,
		level = 1,
		bins = {
			evil_good = 0.3,
		},
		skills = {}
	},
	[hash("magicb3")] = {
		value = 4,
		level = 1,
		bins = {
			evil_good = -0.3,
		},
		skills = {}
	},
	[hash("magicb1")] = {
		value = 3,
		level = 1,
		bins = {
			evil_good = -0.1,
		},
		skills = {}
	},
	[hash("feather02")] = {
		value = 2,
		level = 1,
		bins = {
			anti_authority = -0.1,
		},
		skills = {}
	},
	[hash("eyeball02")] = {
		value = 2,
		level = 1,
		bins = {
			lawless_lawful = -0.2,
		},
		skills = {}
	},
	[hash("eyeball03")] = {
		value = 3,
		level = 1,
		bins = {
			lawless_lawful = -0.3,
		},
		skills = {
			perception = 1
		}
	},
	[hash("drumstick01")] = {
		value = 3,
		level = 1,
		bins = {
			anti_authority = -0.2,
		},
		skills = {
			speed = -2
		}
	},
	[hash("sunhat")] = {
		value = 3,
		level = 1,
		bins = {
			passive_aggressive = -0.2,
		},
		skills = {}
	},
	[hash("magicc5")] = {
		value = 3,
		level = 1,
		bins = {
			evil_good = 0.1,
		},
		skills = {}
	},
	[hash("shrimp02")] = {
		value = 3,
		level = 1,
		bins = {
			poor_wealthy = 0.1,
		},
		skills = {
			charisma = -1
		}
	},
	[hash("avacado")] = {
		value = 3,
		level = 1,
		bins = {
			anti_authority = -0.1,
		},
		skills = {
			charisma = 1
		}
	},
	[hash("gold")] = {
		value = 10,
		level = 1,
		bins = {
			poor_wealthy = 0.4,
		},
		skills = {}
	},
	[hash("gold")] = {
		value = 10,
		level = 1,
		bins = {
			poor_wealthy = 0.4,
		},
		skills = {}
	},
	[hash("cape")] = {
		value = 4,
		level = 1,
		bins = {
			evil_good = -0.1,
		},
		skills = {}
	},
	[hash("glove01")] = {
		value = 3,
		level = 1,
		bins = {
			passive_aggressive = 0.1,
		},
		skills = {}
	},
	[hash("banana")] = {
		value = 2,
		level = 1,
		bins = {
			un_educated = -0.1,
		},
		skills = {}
	},
	[hash("string")] = {
		value = 1,
		level = 1,
		bins = {
			un_educated = 0.1,
		},
		skills = {}
	},
	[hash("mirror")] = {
		value = 1,
		level = 1,
		bins = {},
		skills = {
			perception = -1,
		}
	},
	[hash("leaf03")] = {
		value = 1,
		level = 1,
		bins = {
			poor_wealthy = -0.1
		},
		skills = {
			stealth = -1,
		}
	},
	[hash("leaf01")] = {
		value = 1,
		level = 1,
		bins = {},
		skills = {
			stealth = -1,
		}
	},
	[hash("magicb2")] = {
		value = 3,
		level = 1,
		bins = {
			evil_good = -0.1,
		},
		skills = {},
	},
	[hash("leaf02")] = {
		value = 1,
		level = 1,
		bins = {},
		skills = {
			stealth = -2,
		}
	},
	[hash("mushroom02")] = {
		value = 4,
		level = 1,
		bins = {},
		skills = {
			wisdom = 2,
			intelligence = -2,
		}
	},
	[hash("orange")] = {
		value = 2,
		level = 1,
		bins = {},
		skills = {
			constitution = 1,
		}
	},
	[hash("mushroom03")] = {
		value = 5,
		level = 1,
		bins = {},
		skills = {
			wisdom = 3,
			intelligence = -3,
		}
	},
	[hash("tomato")] = {
		value = 2,
		level = 1,
		bins = {},
		skills = {
			perception = 1,
		}
	},
	[hash("axe")] = {
		value = 5,
		level = 1,
		bins = {},
		skills = {
			constitution = 1,
			speed = -1
		}
	},
	[hash("ring")] = {
		value = 8,
		level = 1,
		bins = {},
		skills = {
			wisdom = 1,
			constitution = -1
		}
	},
	[hash("bronze")] = {
		value = 6,
		level = 1,
		bins = {},
		skills = {
			wisdom = 1,
			constitution = -1
		}
	},
	[hash("potion")] = {
		value = 5,
		level = 1,
		bins = {},
		skills = {
			charisma = 1,
			strength = -1
		}
	},
	[hash("berry02")] = {
		value = 3,
		level = 1,
		bins = {},
		skills = {
			strength = 1,
			wisdom = -1
		}
	},
	[hash("egg01")] = {
		value = 2,
		level = 1,
		bins = {},
		skills = {
			stealth = 1,
			speed = -1
		}
	},
	[hash("envelope")] = {
		value = 1,
		level = 1,
		bins = {},
		skills = {
			perception = 1,
			charisma = -1
		}
	},
	[hash("vial01")] = {
		value = 2,
		level = 1,
		bins = {},
		skills = {
			intelligence = 1,
			stealth = -1
		}
	},
	[hash("vial02")] = {
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
	[hash("fish01")] = {
		value = 3,
		level = 1,
		bins = {},
		skills = {
			charisma = -1,
			strength = 1
		}
	},
	[hash("shears")] = {
		value = 4,
		level = 1,
		bins = {},
		skills = {
			speed = -1,
			perception = 1
		}
	},
	[hash("cheese")] = {
		value = 2,
		level = 1,
		bins = {},
		skills = {
			constitution = -1,
		}
	},
	[hash("pillow")] = {
		value = 2,
		level = 2,
		bins = {},
		skills = {
			strength = -3,
			stealth = 3
		}
	},
	[hash("steak01")] = {
		value = 3,
		level = 2,
		bins = {},
		skills = {
			perception = -1,
			constitution = 1,
		}
	},
	[hash("steak02")] = {
		value = 4,
		level = 2,
		bins = {},
		skills = {
			perception = -3,
			constitution = 3,
		}
	},
	[hash("shrimp01")] = {
		value = 4,
		level = 2,
		bins = {},
		skills = {
			wisdom = -3,
		}
	},
	[hash("daisy")] = {
		value = 4,
		level = 2,
		bins = {
			passive_aggressive = -0.2
		},
		skills = {
			wisdom = 2,
		}
	},
	[hash("earrings")] = {
		value = 9,
		level = 2,
		bins = {},
		skills = {
			stealth = -3,
			charisma = 3
		}
	},
	[hash("coingold")] = {
		value = 10,
		level = 1,
		bins = {},
		skills = {
			intelligence = -1,
			wisdom =1
		}
	},
	[hash("book")] = {
		value = 5,
		level = 1,
		bins = {},
		skills = {
			intelligence = 1,
		}
	},
	[hash("rose")] = {
		value = 6,
		level = 1,
		bins = {},
		skills = {
			charisma = 1,
		}
	},
	[hash("coffeemug")] = {
		value = 2,
		level = 1,
		bins = {},
		skills = {
			speed = 1,
			perception = -1
		}
	},
	[hash("mallot")] = {
		value = 4,
		level = 1,
		bins = {},
		skills = {
			strength = 1,
			wisdom = -1
		}
	},
	[hash("apple")] = {
		value = 2,
		level = 1,
		bins = {},
		skills = {
			constitution = 1,
		}
	},
	[hash("mushroom01")] = {
		value = 1,
		level = 1,
		bins = {},
		skills = {
			wisdom = 1,
			strength = -1
		}
	},
	[hash("sack")] = {
		value = 1,
		level = 1,
		bins = {},
		skills = {
			stealth = 1,
			speed = -1
		}
	},
	[hash("eyeball01")] = {
		value = 0,
		level = 1,
		bins = {},
		skills = {
			perception = 1,
			charisma = -1
		}
	},
	[hash("fish02")] = {
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
	[hash("note")] = {
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
	[hash("apple01")] = {
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