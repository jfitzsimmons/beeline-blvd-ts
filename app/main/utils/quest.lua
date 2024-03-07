local utils = require "main.utils.utils"
local npcs = require "main.states.npcstates"

local M = {}

function M.has_value(t)
	return utils.has_value(t[1](),t[2])
end

function M.any_has_value(t)
	local npcs= t[1]()
	for ni,nv in pairs(npcs) do 
		if utils.has_value(nv.inventory,t[2]) then return true end
	end
	return false
end

function M.returnfalse()
	return false
end

function M.convos_check(args)
	local npcs = args[1]()
	for nk,nv in pairs(npcs) do
		if nv.convos >= args[2] then return true end
	end
	return false
end

function M.max_skills(args)
	local skills = args[1]()
	local order = utils.create_ipairs(skills)
	table.sort(order, function(a, b) return skills[a] > skills[b] end)	
	for count = 1, args[2] do
		if skills[order[count]] < 10 then return false end
	end
	return true
end

function M.max_love(args)
	local count = 10
	local score = 0
	local all = args[1]()
	for _,nv in pairs(utils.shuffle(npcs.order)) do
		if all[nv].love > 5 then score=score+1 end
		count = count-1
		if score > args[2] then return true end
		if count == 0 then return false end
	end
end

return M