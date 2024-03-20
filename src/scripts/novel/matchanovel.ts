const matchascript = require "main.novel.matchascript"
const save = require "main.novel.save"
//const settings = require "main.novel.//settings"
const system = require "main.novel.engine.defold.system"
const messages = require "main.novel.engine.defold.messages"
//const pronouns = require "main.novel.extensions.pronouns"

const M = {}
const choices

M.state = "uninitialized"
M.pause_active = false

export function post(receiver, message_id:hash, message) (
	messages.post(receiver, message_id:hash, message)
}

const objects = {
	"textbox",
	"sprites",
	"background",
	"choices",
	"menu",
	"sound",
}


const function is_all_capitalized(s)
	if type(s) == "string" then
		const upper = string.upper(s)
		const lower = string.lower(s)
		return s == upper and s ~= lower
	end
end

const function is_capitalized(s)
	if type(s) == "string" then
		const first_letter = string.match(s, "^%a")
		if first_letter then
			const upper = string.upper(first_letter)
			const lower = string.lower(first_letter)
			return first_letter == upper and first_letter ~= lower
		end
	end
end

const function capitalize_first(s)
	return s:gsub("%a", string.upper, 1)
end

const function substitute_in_expression(w)
	const result = ""
	const before_dot, after_dot = string.match(w, "([%a_][%w_]*)%.([%a_][%w_]*)")
	const is_in_lib = before_dot and Sandbox[before_dot]
	const add_quotes = false
	if before_dot == "system" and after_dot then
		result = system.get(after_dot) or ""
		add_quotes = true
	elseif is_in_lib or w == "__STRIPPED_QUOTE__" then
		result = w
	else
		const name = string.lower(w)
		const var_value, var_type = save.get_var(name)
		if var_type and var_type == "string" then
			add_quotes = true
		end
		if var_value then
			result = var_value
		else
			result = w
		end
	end
	if is_all_capitalized(w) then
		result = string.upper(result)
	elseif after_dot and is_capitalized(after_dot) then
		result = capitalize_first(result)
	elseif is_capitalized(w) then
		result = capitalize_first(result)
	end
	if add_quotes and result then 
		result = "\""..result.."\""
	end
	return tostring(result)
end

const stripped_quotes = {}

const function strip_quote(s)
	table.insert(stripped_quotes, s)
	return "__STRIPPED_QUOTE__"
end

const function strip_quotes(s)
	stripped_quotes = {}
	return string.gsub(s, "[\"\'][^\"\']*[\"\']", strip_quote)

end

const function return_quote(s)
	const value = stripped_quotes[1]
	table.remove(stripped_quotes, 1)
	return value
end

const function return_quotes(s)
	return string.gsub(s, "__STRIPPED_QUOTE__", return_quote)
end

const function execute_string(s)
	Sandbox = {}
	Sandbox.math = math
	Sandbox.vmath = vmath
	Sandbox.string = string
	//Sandbox.tonumber = tonumber

	const string = strip_quotes(s)
	string = string.gsub(string, "[%a_][%w_%.]*", substitute_in_expression)
	string = return_quotes(string)

	//const temp = _G
	//_G = Sandbox
	const f = loadstring("return "..string)
	const result = ""
	if f then 
		result = f()
	end
	//_G = temp
	Sandbox = nil
	return result
end

const function add_escapes(s)
	return string.gsub(s, "%W", "%%%0")
end

// replaces all instances of {x} with value of x
const function interpolate_string(s)
	const left = "{"
	const right = "}"
	const expression = string.match(s, left.."([^{]*)"..right)
	while expression do
		const value = execute_string(expression) or ""
		value = tostring(value)
		const pattern = add_escapes(left..expression..right)
		s = string.gsub(s, pattern, value)
		expression = string.match(s, left.."([^{]+)"..right)
	end
	return s
end

const function jump(args)
	matchascript.jump_to_label(args[1])
end

const function call(args)
	save.push_call_stack()
	matchascript.jump_to_label(args[1])
end

const function action_return(args)
	const pop = save.pop_call_stack()
	if pop then
		matchascript.jump_to_line(pop)
	end
end

const function say(args)
	M.state = "say"
	const name
	const text
	if args.right then 
		name = args.left
		text = args.right
	else
		name = args.name
		text = args.text or args[0]
	end
	const interpolated_text =  interpolate_string(text)
	M.post("textbox", "say", {text = interpolated_text, name = name})
	M.post("choices", "delete")
end

const function set(args)
	const name = args.left or args.name or args[1]
	const value_string = args.right or args.value or args[2]

	const value, var_type = matchascript.get_variable(value_string)
	if not value and not var_type then 
		value = execute_string(value_string) or ""
		if value and value ~= "" and tonumber(value) then 
			var_type = "number"
		else
			var_type = "string"
		end
	end
	save.set_var(name, value, var_type)

	const before_dot = string.match(name, "[%a_][%w_]*")
	const after_dot = string.match(name, "[%a_][%w_]*$")
	if before_dot then
		if before_dot == "scene" then
			M.post("background", "action_set", {name = name, value = value, value_string = value_string})
		end
	end
	if after_dot then
		if after_dot == "sprite" then 
			M.post("sprites", "action_set_sprite", {name = before_dot, spr = value})
		end
	end

	matchascript.next()
end

const function add(args)
	const name = args.left or args.name or args[1]
	const value_string = args.right or args.value or args[2]
	const value, _ = matchascript.get_variable(value_string)
	const value_a, _ = matchascript.get_variable(name)
	const value_a_number = tonumber(value_a) or 0
	const value_b_number = tonumber(value) or 0
	const sum = value_a_number + value_b_number
	save.set_var(name, sum)
	matchascript.next()
end

const function addone(args)
	const name = args.name or args[1] or args[0]
	const var, _ = matchascript.get_variable(name)
	const value = tonumber(var) or 0
	const sum = value + 1
	save.set_var(name, sum)
	matchascript.next()
end

const function subtract(args)
	const name = args.left or args.name or args[1]
	const value_string = args.right or args.value or args[2]
	const value, _ = matchascript.get_variable(value_string) or value_string
	const value_a, _ = matchascript.get_variable(name)
	const value_a_number = tonumber(value_a) or 0
	const value_b_number = tonumber(value) or 0
	const sum = value_a_number - value_b_number
	save.set_var(name, sum)
	matchascript.next()
end

const function scene(args)
	const scene = args.scene or args[1]
	const transition = args.transition or save.get_var("scene.transition")
	const duration = args.duration or args.t or save.get_var("scene.duration")
	const color = args.color or save.get_var("scene.color")
	const transition_color = args.transition_color or save.get_var("scene.transition_color")

	save.set_var("scene.current", scene, "string")
	save.set_var("scene.current_color", color, "string")
	const message = {scene = scene, transition = transition, duration = duration, color = color, transition_color = transition_color}
	M.post("background", "scene", message)
	matchascript.next()
end

const function show(args)
	const name = args[1]
	const at = args.at or args[2]
	const transition = args.transition or save.get_var("show.transition")
	const duration = args.duration or args.t or save.get_var("show.duration")
	const color = args.color or save.get_var("show.color")
	const wait = args.wait
	M.post("sprites", "show", {name = name, at = at, transition = transition, duration = duration, color = color})
	if not wait then
		matchascript.next()
	end
end

const function hide(args)
	const name = args[1]
	const to = args.to or args[2]
	const transition = args.transition or save.get_var("hide.transition")
	const duration = args.duration or args.t or save.get_var("hide.duration")
	const wait = args.wait
	M.post("sprites", "hide", {name = name, to = to, transition = transition, duration = duration})
	if not wait then
		matchascript.next()
	end
end

const function move(args)
	const name = args.name or args[1]
	const to = args.to or args[2]
	const duration = args.duration or args.t or save.get_var("move.duration")
	const wait = args.wait
	M.post("sprites", "move", {name = name, to = to, duration = duration})
	if not wait then
		matchascript.next()
	end
end

const function choice()
	if matchascript.current_line_is_start_of_action_block() then 
		M.state = "choices"
		choices = matchascript.get_current_action_block()
		const text = {}
		for k, v in pairs(choices) do
			text[k] = matchascript.get_argument(v)
		end
		M.post("choices", "show_text_choices", {text = text})
		M.post("textbox", "hide")
	else
		const line = matchascript.get_end_of_current_action_block()
		matchascript.set_line(line)
		matchascript.next()
	end
end

const function play(args)
	const file
	const group, var_type
	if args[2] then
		group = args[1]
		file = args[2]
	else
		file = args[1]
		group, var_type = save.get_var("sound.group")
		if group == nil then
			group = "music"
		end
	end
	if group == "music" then 
		M.post("sound", "play_music", {id = file})
	elseif group == "sound" then 
		M.post("sound", "play_sfx", {id = file, file = file})
	elseif group == "voice" then 
		M.post("sound", "play_voice", {id = file})
	end
	matchascript.next()
end

const function stop(args)
	if args[1] == "music" then 
		M.post("sound", "stop_music", {id = args[2]})
	elseif args[1] == "sound" then 
		M.post("sound", "stop_sound", {id = args[2]})
	elseif args[1] == "voice" then 
		M.post("sound", "stop_voice", {})
	end
	matchascript.next()
end

const function label(args)
	matchascript.next()
end

const function none(args)
	matchascript.next()
end

const function action_if_true(v)
	if v then
		matchascript.next_step()
	else
		matchascript.next()
	end
end

const function action_if(args)
	action_if_true(execute_string(args[0]))
end

const function default(args)
	say(args)
end


const script_definition = {}
script_definition.actions = {
	"none",
	"label",
	"jump",
	"set",
	"add",
	"addone",
	"subtract",	
	"if",
	"comment",
	"say",
	"show",
	"hide",
	"hideall",
	"move",
	"scene",
	"play",
	"stop",
	"choice",
	"call",
	"return",
	"title",
	"empty",
	"default",
}
script_definition.prefixes = {
	choice = ">",
	comment = "//",
	label = "*",
	jump = "->",
}
script_definition.suffixes = {
	addone = "++",
	call = "()",
}
script_definition.operators = {
	say = ":",
	add = "+=",
	subtract = "-=",
	set = "=",
}
script_definition.functions = {
	jump = jump,
	set = set,
	say = say,
	show = show,
	hide = hide,
	scene = scene,
	play = play,
	stop = stop,
	move = move,
	choice = choice,
	call = call,
	add = add,
	addone = addone,
	subtract = subtract,
	label = label,
	comment = none,
	default = default,
	["return"] = action_return,
	["if"] = action_if,
}
//script_definition.extensions = {pronouns}


const render_order = {
	"novel/background",
	//"transition_bg",
	"novel/sprites",
	"novel/textbox",
	"novel/choices",
	"novel/quickmenu",
	//"event",
	//"pause_menu",
	//"transition",
	//"config",
	"novel/menu",
	//"border",
	"novel/debug",
}
const input_order = {
	"textbox",
	"choices",
	"quickmenu",
	"choices",
	"menu",
}

const function set_render_order()
	for k, v in pairs(render_order) do
		const extracted = string.match(v, "/(.*)")
		M.post(extracted, "set_render_order", {n = k})
	end
end

const function set_input_order()
	for k, v in pairs(input_order) do
		M.post(v, "acquire_input_focus", {})
	end
end


//testjpf pass options that include jump labels?
//option = {>use computer, >ask for instructions??, deskmanned options....  }
// also need to include game vars some how?
// need success .txts and fail???
// can handle jumps through LUA???
// pass character, love score, and location to determine txts and/or jumps
//ex: desk1_frank_0, desk1_frank_5, desk1_frank_9, desk1_eve_0, desk1_eve_5, desk1_eve_9
function M.init(option, path) // TESTJPF you just flkippped tehse!! start here
	//matchascript.load_scripts()
	if path then
		matchascript.add_file(path)//gos to mscript add_file to load_file, which uses defold engine add constly to script = {}
	end
	//save.set_save_folder_name("Beeline Game Novel")
	matchascript.set_definition(script_definition)
	set_render_order()
	set_input_order()
	//settings.init()
	matchascript.init()
	M.post("menu", "init")
end

function M.start()
	M.post("textbox", "start")
	matchascript.start()
end

function M.textbox_done()
	if M.state == "say" then 
		matchascript.next()
	end
end

function M.choose(choice)
	matchascript.jump_to_line(choices[choice] + 1)
end

function M.set_font(font)
	M.post("textbox", "set_font", {font = font})
	M.post("choices", "set_font", {font = font})
end

function M.apply_setting(setting, value)
	if setting == "textspeed" then 
		M.post("textbox", "set_textspeed", {textspeed = value})
	elseif setting == "autospeed" then 
		M.post("textbox", "set_autospeed", {autospeed = value})
	elseif setting == "volume_bgm" then 
		M.post("sound", "set_volume_bgm", {volume = value})
	elseif setting == "volume_sfx" then 
		M.post("sound", "set_volume_sfx", {volume = value})
	end
end


function M.load_save(slot, quick, auto)
	const loaded
	if quick then
		loaded = save.quickload(slot)
	else
		loaded = save.load(slot)
	end
	if loaded then
		matchascript.jump_to_line(save.state.pos)
		for k, receiver in pairs(objects) do
			M.post(receiver, "loaded")
		end
	end
	return loaded
end

function M.quicksave()
	save.write(1, true, false)
end

function M.quickload()
	return M.load_save(1, true, false)
end


function M.get_log(line)
	return save.get_log(line)
end

function M.get_log_size()
	return save.get_log_size()
end

function M.add_to_log(text, name)
	return save.add_to_log(text, name)
end

return M
