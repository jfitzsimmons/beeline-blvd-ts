local M = {}
M.all = {}
M.layout = {
	{"alley1","alley2","alley3",nil,nil},
	{"unloading","warehouse","commonsext","storage","maintenance"},
	{"loading","lockers","commonsint","chapel","inn1"},
	{"baggage","customs","lobby","recroom","pubgrill"},
	{"grounds","reception","admin1","gym","store"},
	{"entrance","viplobby","security","infirmary","dorms"}
}
M.roles = {
	desk = {"staff","security"},
	host = {"staff","gang1","gang2"},
	tender = {"staff","gang3","gang4"},
	bar = {"doctors", "corps","visitors","church","contractors","sexworkers","labor", "security"},
	table = {"doctors", "corps","visitors","church","contractors","sexworkers","labor", "security"},
	bench ={"labor", "contractors", "gang1","gang3"},
	browse = {"staff", "labor", "contractors","gang2","gang4","security"},
	monitor = {"security","staff","corps","doctors"},
	guard = {"security","gang1", "gang3"},
	patrol = {"security","gang2", "gang4", "corps","staff"},
	loiter1 = {"sexworkers", "visitors", "church", "corps", "gang1", "gang2", "contractors"},
	loiter2 = {"sexworkers", "staff", "church", "gang3", "gang4", "contractors","labor"},
	loiter3 = {"doctors", "sexworkers", "visitors", "staff", "corps", "security", "gang4", "labor"},
	loiter4 = {"doctors", "sexworkers", "visitors", "corps", "security", "gang4", "labor"},
	lounge = {"doctors", "sexworkers", "visitors", "staff", "church", "corps", "contractors", "labor"},
	worker1 = {"labor", "gang1", "gang3", "gang4", "contractors"},
	worker2 = {"labor", "gang2", "gang4", "contractors"},
	boss = {"corps", "gang2", "gang1", "gang3", "contractors"},
	assistant = {"gang2", "gang1", "gang3", "contractors", "staff","doctors"},
	aid = {"doctors", "staff", "labor", "church", "visitors", "security"},
	guest = {"labor", "church", "visitors", "contractors","sexworkers"},
	guest2 = {"visitors", "church", "doctors"},
	vipguest = {"church", "visitors", "contractors","sexworkers","doctors"},
	authority = {"corps", "church"},
	servants2 = {"staff","security", "gang2", "gang4","church","sexworkers","labor"},
	servants1 = {"staff", "gang1", "gang2", "gang3", "gang4","church","labor"},
	employee = {"staff", "gang1", "gang3"},
	gang= {"gang1", "gang2", "gang3", "gang4"}
}

M.fallbacks={
	stations = {
		admin1_passer= "", 
		security_passer= "",
		reception_unplaced= "",
		grounds_unplaced= "",
	},
}

M.all["baggage"] = {
	matrix = { x = 1, y = 4,},
	roomname = "baggage",
	stations = {
		guard= "", 
		worker1= "",
		assistant= "",
		browse= "",
	},
	actors = {
		luggage_1 = {
			inventory = {},
			watcher = "browse",
			actions = {"open"},
		},
		luggage_2 = {
			inventory = {},
			watcher = "guard",
			actions = {"open"},
		}
	}
}
M.all["viplobby"] = {
	matrix = { x = 2, y = 6,},
	roomname = "viplobby",
	stations = {
		guard= "", 
		vipguest= "",
		boss= "",
		authority= "",
		host= "",
		desk="",
		servants1=""
	},
	actors = {}
}
M.all["entrance"] = {
	matrix = { x = 1, y = 6,},
	roomname = "entrance",
	stations = {
		loiter2= "", 
		worker1= "",
		loiter3= "",
		guest= "",
		guest2= "",
		host= "",
	},
	actors = {}
}
M.all["recroom"] = {
	matrix = { x = 4, y = 4 },
	roomname = "recroom",
	stations = {lounge = "", loiter1 = "", loiter2 = "", worker2= "",guest="", bench="", browse=""},
	actors = {}
}
M.all["security"] = {
	matrix = { x = 3, y = 6 },
	roomname = "security",
	stations = {guard = "", authority = "", assistant = ""},
	prisoners = {prisoner1 = "", prisoner2 = "", prisoner3 = "", prisoner4 = ""},
	actors = {}
}
M.all["chapel"] = {
	matrix = { x = 4, y = 3 },
	roomname = "chapel",
	stations = {loiter1 = "", loiter2  = "", authority  = "", loiter3 = "", guest="", loiter4=""},
	actors = {
	}
}
M.all["inn1"] = {
	matrix = { x = 5, y = 3,},
	roomname = "inn1",
	stations = {loiter3 = "", host  = "", tender = "", guest = "", lounge="", loiter1 = "",},
	actors = {}
}
M.all["pubgrill"] = {
	matrix = { x = 5, y = 4,},
	roomname = "pubgrill",
	stations = {host = "",bar  = "",table  = "", tender  = "", loiter3="", guest=""},
	actors = {}
}
M.all["maintenance"] = {
	matrix = { x = 5, y = 2,},
	roomname = "maintenance",
	stations = {bench= "",patrol= "", browse="", worker1=""},
	actors = {}
}
M.all["lobby"] = {
	matrix = { x = 3, y = 4,},
	roomname = "lobby",
	stations = {loiter1= "",loiter2= "",guard= "",loiter4="",table="",guest="",loiter3= ""},
	actors = {
	}
}
M.all["storage"] = {
	matrix = { x = 4, y = 2,},
	roomname = "storage",
	stations = {patrol= "",guard= "",assistant="",browse="", employee=""},
	actors = {}
}
M.all["commonsint"] = {
	matrix = { x = 3, y = 3,},
	roomname = "commonsint",
	stations = {loiter1= "",loiter2= "",loiter3="",loiter4="",lounge= "", guest="", servants1=""},
	actors = {}
}
M.all["commonsext"] = {
	matrix = { x = 3, y = 2,},
	roomname = "commonsext",
	stations = {loiter1= "",loiter2= "",loiter3="",patrol= "", table="", guest="",servants2=""},
	actors = {
	}
}
M.all["warehouse"] = {
	matrix = { x = 2, y = 2,},
	roomname = "warehouse",
	stations = {worker1= "",worker2= "",boss= ""},
	actors = {}
}
M.all["lockers"] = {
	matrix = { x = 2, y = 3,},
	roomname = "lockers",
	stations = {loiter1= "",patrol= "",loiter2= "", table="", lounge="", guest="", servants2=""},
	actors = {}
}
M.all["unloading"] = {
	matrix = { x = 1, y = 2,},
	roomname = "unloading",
	stations = {worker1= "",worker2= "",boss= "",servants1="", gang="", guard= "",},
	actors = {}
}
M.all["alley3"] = {
	matrix = { x = 3, y = 1,},
	roomname = "alley3",
	stations = {worker1= "",servants1="", gang="",loiter2="", loiter4="",servants2="", patrol=""},
	actors = {}
}
M.all["alley2"] = {
	matrix = { x = 2, y = 1,},
	roomname = "alley2",
	stations = {worker1= "",servants1="", gang="",loiter2="", guard=""},
	actors = {}
}
M.all["alley1"] = {
	matrix = { x = 1, y = 1,},
	roomname = "alley1",
	stations = {worker1= "",worker2= "",servants1="", gang="", patrol=""},
	actors = {}
}
M.all["loading"] = {
	matrix = { x = 1, y = 3,},
	roomname = "loading",
	stations = {worker1= "",worker2= "",boss= "", patrol="", gang=""},
	actors = {}
}
M.all["admin1"] = {
	matrix = { x = 3, y = 5,},
	roomname = "admin1",
	props = {"desks", "locker"},
	stations = {monitor="",patrol="",guard="", assistant="", boss="", desk=""},
	actors = {
		desks = {
			inventory = {},
			actions = {"pickup", "use"},

		},
		locker = {
			inventory = {},
			actions = {"use", "open"},
		},
	}
}
M.all["customs"] = {
	matrix = { x = 2, y = 4,},
	roomname = "customs",
	props = {"desks", "locker"},
	stations = {desk= "",loiter1= "",guard= "",patrol="", loiter3="", loiter4="", guest=""},
	actors = {
		desks = {
			inventory = {hash("deskbook01"), hash("globegold")},
			actions = {"pickup", "use"},

		},
		locker = {
			inventory = {hash("silver"), hash("mushroom01")},
			actions = {"use", "open"},
		},
	}
}
M.all["reception"] = {
	matrix = { x = 2, y = 5,},
	roomname = "reception",
	props = {"drawer", "computer"},
	stations = {desk = "", patrol = "", guard = "", loiter2 = "",loiter4 = "",guest = "", guest2=""},
	actors = {
		drawer = {
			inventory = {hash("cheese"), hash("shrimp01")},
			actions = {"open"},
			watcher = "desk",
		},
		computer = {
			inventory = {},
			actions = {"use"},
			watcher = "desk",
		},
		vase = {
			inventory = {hash("pillow"), hash("book")},
			actions = {"open"},
			watcher = "loiter2"
		},
		vase2 = {
			inventory = {hash("steak01"), hash("leaf03"), hash("daisy")},
			actions = {"open"},
			watcher = "patrol"
		}
	}
}
M.all["grounds"] = {
	matrix = { x = 1, y = 5,},
	roomname = "grounds",
	stations = {
		assistant= "", 
		worker1= "",
		aid= "",
		guest= "",
		worker2= "",
		loiter1="",
		guest2=""
	},
	actors = {
		player_luggage = {
			inventory = {hash("berry01"), hash("feather01"), hash("magica1")},
			watcher = "worker2",
			actions = {"open"},
		},
		other_luggage = {
			inventory = {hash("eyeball03"), hash("feather02"), hash("magicb1")},
			watcher = "worker2",
			actions = {"open"},
		}
	}
}
M.all["dorms"] = {
	matrix = { x = 5, y = 6,},
	roomname = "dorms",
	stations = {
		bench= "", 
		servants1= "",
		servants2= "",
		assistant="",
		loiter2="",
		gang=""
	},
}
M.all["gym"] = {
	matrix = { x = 4, y = 5,},
	roomname = "gym",
	stations = {
		--guest= "", 
		browse= "",
		--loiter2= "",
		loiter4="",
		bench = "",
		servants1="",
	},
}
M.all["store"] = {
	matrix = { x = 5, y = 5,},
	roomname = "store",
	stations = {
		guest= "", 
		servants1= "", 
		employee= "",
		patrol= "",
		loiter3= "",
		worker1= "",
		loiter2 = "",
	},
}
M.all["infirmary"] = {
	matrix = { x = 4, y = 6,},
	roomname = "infirmary",
	props = {"drawer", "computer"},
	stations = {
		aid= "", 
		loiter1= "",
		loiter2= "",
		assistant="",
		loiter4=""
	},
	actors = {
		drawer = {
			inventory = {hash("vial02")},
			actions = {"open"},
			watcher = "assistant",
		},
		computer = {
			inventory = {},
			actions = {"use"},
			watcher = "assistant",
		},

	}
}

function M.clear_room_stations()
	for rname,room in pairs(M.all) do
		for sname,station in pairs(room.stations) do
			M.all[rname].stations[sname] = ""
		end
	end
	for sname,station in pairs(M.fallbacks.stations) do
		M.fallbacks.stations[sname] = ""
	end
end

return M