local utils = require "main.utils.utils"

local M = {}

M.all = {
	crimewave = {
		label = "crimewave",
		turns = 10,
		fx = {
			type = "binaries",
			stat = "lawless_lawful",
			adjustment = 0.2
		}
	},
	yogi = {
		label = "yogi",
		turns = 10,
		fx = {
			type = "skills",
			stat = "wisdom",
			adjustment = 2
		}
	},
	angel = {
		label = "angel",
		turns = 10,
		fx = {
			type = "binaries",
			stat = "evil_good",
			adjustment = 0.2
		}
	},
	devil = {
		label = "devil",
		turns = 10,
		fx = {
			type = "binaries",
			stat = "evil_good",
			adjustment = -0.2
		}
	},
	inspired = {
		label = "inspired",
		turns = 10,
		fx = {
			type = "skills",
			stat = "constitution",
			adjustment = 2
		}
	},
	eagleeye = {
		label = "eagleeye",
		turns = 10,
		fx = {
			type = "skills",
			stat = "perception",
			adjustment = 2
		}
	},
	modesty = {
		label = "modesty",
		turns = 10,
		fx = {
			type = "binaries",
			stat = "poor_wealthy",
			adjustment = -0.2
		}
	},
	admirer = {
		label = "admirer",
		turns = 10,
		fx = {
			type = "attitudes",
			stat = "",
			adjustment = 3
		}
	},
	opportunist = {
		label = "opportunist",
		turns = 10,
		fx = {
			type = "binaries",
			stat = "lawless_lawful",
			adjustment = -0.2
		}
	},
	amped = {
		label = "amped",
		turns = 10,
		fx = {
			type = "binaries",
			stat = "passive_aggressive",
			adjustment = 0.2
		}
	},
	prejudice = {
		label = "prejudice",
		turns = 10,
		fx = {
			type = "attitudes",
			stat = "",
			adjustment = -3
		}
	},
	incharge = {
		label = "incharge",
		turns = 10,
		fx = {
			type = "binaries",
			stat = "anti_authority",
			adjustment = 0.2
		}
	},
	boring = {
		label = "boring",
		turns = 10,
		fx = {
			type = "skills",
			stat = "charisma",
			adjustment = -2
		}
	},
	loudmouth = {
		label = "loudmouth",
		turns = 10,
		fx = {
			type = "skills",
			stat = "stealth",
			adjustment = -2
		}
	},
	vanity = {
		label = "vanity",
		turns = 10,
		fx = {
			type = "skills",
			stat = "charisma",
			adjustment = 2
		}
	},
	inhiding = {
		label = "inhiding",
		turns = 10,
		fx = {
			type = "skills",
			stat = "stealth",
			adjustment = 2
		}
	},
	inshape = {
		label = "inshape",
		turns = 10,
		fx = {
			type = "skills",
			stat = "strength",
			adjustment = 2
		}
	},
	readup = {
		label = "readup",
		turns = 10,
		fx = {
			type = "skills",
			stat = "intelligence",
			adjustment = 2
		}
	},
	dunce = {
		label = "dunce",
		turns = 10,
		fx = {
			type = "skills",
			stat = "intelligence",
			adjustment = -2
		}
	},
	lazy = {
		label = "lazy",
		turns = 10,
		fx = {
			type = "skills",
			stat = "constitution",
			adjustment = -2
		}
	},
	ignorant = {
		label = "ignorant",
		turns = 10,
		fx = {
			type = "skills",
			stat = "wisdom",
			adjustment = -2
		}
	},
	distracted = {
		label = "distracted",
		turns = 10,
		fx = {
			type = "skills",
			stat = "perception",
			adjustment = -2
		}
	}
}
-- testjpf probably makes more sense to send a key that deep copy
function M.remove_effects_bonus(a,e)
	a[e.fx.type][e.fx.stat] = a[e.fx.type][e.fx.stat] - e.fx.adjustment
end

function M.add_effects_bonus(a,e)
	print("add_effects_bonus",a.labelname,"type:",e.fx.type,"stat:",e.fx.stat)
	a[e.fx.type][e.fx.stat] = a[e.fx.type][e.fx.stat] + e.fx.adjustment
end

function M.remove_effects(a)
	if #a.effects > 0 then 
		for _,ev in pairs(a.effects) do
			if ev.turns < 0 then 
				M.remove_effects_bonus(a, ev)
				table.remove(a.effects, _)
			else
				ev.turns = ev.turns - 1
			end
		end
	end
end

return M