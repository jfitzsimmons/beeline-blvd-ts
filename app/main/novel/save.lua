local M = {}

local defined_variables = {}
local defined_variables_type = {}


M.state = {}
M.state.pos = 0  -- the line of text you're on
M.state.log = {} -- assign text to name that's saying it?
M.state.log_names = {}  -- name that is saying line of text?
M.state.var = {} --"scene.current", scene, "string" --value: scene, -keyvar: scene.current 
M.state.var_type = {} --"scene.current", scene, "string" --value: "string", -keyvar: scene.current 
M.state.call_stack = {}-- so when you jump to a label, you kow where to go back to
M.state.sprites = {}
--M.state.sprites.current = {}

function M.reset()
	M.state.pos = 0
	M.state.log = {}
	M.state.var = {}
	M.state.var_type = {}
	M.state.call_stack = {}
	M.state.sprites = {}
end

function M.set_var(this, name, value, type)
	M.state.var[name] = value
	M.state.var_type[name] = type
end

function M.define(name, value, type)
	defined_variables[name] = value
	defined_variables_type[name] = type
end

function M.get_var(this,name)
	--print("save get vasr: ",name)
	local value = M.state.var[name] or defined_variables[name]
	--print("value", value)
	local type = M.state.var_type[name] or defined_variables_type[name]
	--print("type", type)

	if type == "pointer" then 
		local v, t = M.get_var(this, value)
		if v then
			return {v, t}
		else
			return {value, "string"}
		end
	else
		return {value, type}
	end
	
end

function M.get_type(name)
	return M.state.var_type[name] or defined_variables_type[name]
end


function M.set_global_sys_var(name, value)
	if M.global[name] ~= value then
		M.global[name] = value
		flag_write_global = true
	end
end


function M.add_to_log(text, name)
	if text then 
		table.insert(M.state.log, text)
		table.insert(M.state.log_names, name or "")
	end
end

function M.get_log(line)
	return M.state.log[line], M.state.log_names[line]
end

function M.get_log_size()
	return #M.state.log
end

function M.reset_log()
	M.state.log = {} 
	M.state.log_names = {} 
end

function M.push_call_stack(pos)
	pos = pos or M.state.pos
	table.insert(M.state.call_stack, pos)
end

function M.pop_call_stack()
	local n = #M.state.call_stack
	if n > 0 then 
		local pop = M.state.call_stack[n]
		table.remove(M.state.call_stack, n)
		return pop
	else
		return false
	end 
end

return M