local npcs = require "main.states.npcstates"
local questutils = require "main.utils.quest"
local player = require "main.states.playerstate"

local M = {}

M.quests = {
	medic_assist = {
		passed = false,
		conditions = {
			[1] = {
				passed = false,
				interval = "interact",
				func = questutils.convos_check, 
				args = {npcs.return_doctors, 1}
			}, --have you talked to a doctor?
			[2] = {
				passed = false,
				interval = "interact",
				func = questutils.any_has_value,
				args = {npcs.return_doctors, hash("apple01")}
			}, -- doc needs some item
			[3] = {
				passed = false,
				interval = "interact",
				func = questutils.any_has_value,
				args = {npcs.return_doctors, hash("vial02")}
			}, --gets keycard, goes to infirmary, gets meds
		}
	}, -- charmer
	npcs_like_you = {
		passed = false,
		conditions = {
			[1] = {
				interval = "interact",
				func = questutils.max_love,
				args = {npcs.return_all, 5},
			}, --1st -- labor003
		}
	}, -- charmer
	maxout_skill = {
		passed = false,
		conditions = {
			[1] = {
				interval = "interact",
				func = questutils.max_skills,
				args = {player.return_skills, 3}
			}, -- speed
		}
	}, -- go getter
	ai_puzzle = {
		passed = false,
		conditions = {
			[1] = {
				func = questutils.returnfalse,
				args = {}
			}, -- flag maintenance
			[2] = {
				func = questutils.returnfalse,
				args = {}
			}, -- "unscrew monitor"
			[3] = {
				func = questutils.returnfalse,
				args = {}
			}, -- help maintenance 
		}
	}, -- technician
	obtain_luggage = {
		passed = false,
		conditions = {
			[1] = {
				interval = "interact",
				func = questutils.has_value,
				args = {player.return_inventory, hash("berry01")}
			},
			[2]= {
				interval = "interact",
				func = questutils.has_value,
				args = {player.return_inventory, hash("feather01")}
			},
			[3]= {
				interval = "interact",
				func = questutils.has_value,
				args = {player.return_inventory, hash("magica1")}
			}
		}
	}, -- DIY
	key_card = {
		passed = false,
		conditions = {
			[1] = {
				func = questutils.returnfalse,
				args = {}
			}, -- steal a key card
			[2] = {
				func = questutils.returnfalse,
				args = {}
			}, -- find blank id form
			[3] = {
				func = questutils.returnfalse,
				args = {}
			}, -- learn to make a forgery
		}
	}, -- fake id
	charm_authority = {
		passed = false,
		conditions = {
			[1] = {
				func = questutils.returnfalse,
				args = {}
			},  -- pass a "perfect" charm check
			[2] = {
				func = questutils.returnfalse,
				args = {}
			},  -- complete a side quest
			[3] = {
				func = questutils.returnfalse,
				args = {}
			},  -- at least 1 church, security and corps love
		},
		side_checkpoints = {
			[1] = {
				func = questutils.returnfalse,
				args = {}
			},
			[2] = {
				func = questutils.returnfalse,
				args = {}
			}, -- key card
		}
	}, -- vouged for
	charm_gangs = {
		passed = false,
		conditions = {
			[1] = {
				func = questutils.returnfalse,
				args = {}
			}, -- pass a "perfect" charm check
			[2] = {
				func = questutils.returnfalse,
				args = {}
			}, -- complete a side quest
			[3] = {
				func = questutils.returnfalse,
				args = {}
			}, -- 3 of 4 gang loves
		},
		side_quests = {
			[1] = {
				func = questutils.returnfalse,
				args = {}
			},
			[2] = {
				func = questutils.returnfalse,
				args = {}
			}, -- ai maintenace
		}
	} -- vouged for
}

return M