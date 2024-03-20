--math.randomseed(os.time()) 

local M = {}

function M.deepcopy(orig)
	local orig_type = type(orig)
	local copy
	if orig_type == 'table' then
		copy = {}
		for orig_key, orig_value in next, orig, nil do
			copy[M.deepcopy(orig_key)] = M.deepcopy(orig_value)
		end
		setmetatable(copy, M.deepcopy(getmetatable(orig)))
	else -- number, string, boolean, etc
		copy = orig
	end
	return copy
end

function M.get_index(tab, val)
	local index = nil
	for i, v in ipairs(tab) do 
		if (v == val) then
			index = i 
		end
	end
	return index
end

function M.shuffle(tbl)	
	for i = #tbl, 2, -1 do
		local j = math.random(i)
		tbl[i], tbl[j] = tbl[j], tbl[i]
	end
	return tbl
end

function M.has_value(tab, val)
	for index, value in ipairs(tab) do
		if value == val then
			return true
		end
	end

	return false
end

function M.dice_roll()
	local chances = {math.random(),math.random()}
	table.sort(chances)
	return chances
end

function M.create_ipairs(ps)
	local ips = {}
	for k,v in pairs(ps) do 
		table.insert(ips, k)
	end
	return ips
end

return M