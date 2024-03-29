/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
const matchascript = require('../../../main.novel.matchascript')
const save = require('../../../main.novel.save')
//const settings = require "main.novel.//settings"
//const system = require "main.novel.engine.defold.system"
const messages = require('../../../main.novel.engine.defold.messages')
let Sandbox: any = { math, vmath, string }
//const pronouns = require "main.novel.extensions.pronouns"
let stripped_quotes: string[] = []
let choices: { [key: number]: string }

let state = 'uninitialized'
//let pause_active = false
/** 
export function messages.post(
  this: any,
  receiver: string,
  message_id: hash,
  message?: {
    n?: number
    to?: string
    at?: string
    scene?: string
    transition?: string
    duration?: number
    color?: string
    transition_color?: string
    value?: string | number | boolean
    value_string?: string
    text?: { [key: string]: string } | string | undefined
    name?: string
    spr?: string | undefined | boolean
    font?: string
  }
) {
	print(message.)
  messages.messages.post(receiver, message_id, message)
}
**/

function is_all_capitalized(s: string) {
  if (type(s) == 'string') {
    const upper = string.upper(s)
    const lower = string.lower(s)
    return s == upper && s != lower
  }
}

function is_capitalized(s: string) {
  if (type(s) == 'string') {
    let first_letter: string = s.charAt(0)
    //if (first_letter ){
    first_letter = first_letter[0]
    const upper = string.upper(first_letter)
    const lower = string.lower(first_letter)
    return first_letter == upper && first_letter != lower
    //	}
  }
}

function capitalize_first(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1)
}
/** 
function sysget(name: string){
	print("sysget arg(name)::", name)
	if (name == "get" ){ return }
	for( k, v in pairs(M)) do {
		if (name == k ){ 
			return v
		}
	}
	if (name == "time" ){ 
		return os.time()
	} else if ( name == "time_string" ){ 
		return os.date("%Y-%m-%d %T")
	} else if ( name == "time_date" ){ 
		return os.date("%Y-%m-%d")
	} else if ( name == "time_year" ){ 
		return os.date("%Y")
	} else if ( name == "time_month" ){ 
		return os.date("%m")
	} else if ( name == "time_day" ){ 
		return os.date("%d")
	} else if ( name == "time_clock" ){ 
		return os.date("%T")
	} else if ( name == "time_hour" ){ 
		return os.date("%H")
	} else if ( name == "time_minute" ){ 
		return os.date("%M")
	} else if ( name == "time_second" ){ 
		return os.date("%S")
	} else if ( name == "time_weekday" ){ 
		return os.date("%w")
	} else if ( name == "os_clock" ){ 
		return os.clock()
	} else if ( name == "is_fullscreen" ){ 
		return defos.is_fullscreen()
	//} else if ( name == "mouse_x" ){ 
	//} else if ( name == "mouse_y" ){
	}
}**/

function substitute_in_expression(w: string) {
  print('new WWWWWW: ', w)
  let result = ''
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  print('in substiotue', w)
  const [before_dot, after_dot] = string.match(
    w,
    '([%a_][%w_]*)%.([%a_][%w_]*)'
  )
  print('after string match for NIL W')
  const is_in_lib = before_dot !== '' && Sandbox[before_dot]

  //const is_in_lib = before_dot && Sandbox[before_dot]
  let add_quotes = false
  //if (before_dot == "system" && after_dot ){
  //	result = sysget(after_dot) || ""
  //	add_quotes = true
  //} else
  if (is_in_lib == true || w == '__STRIPPED_QUOTE__') {
    print('in substiotue::: IF IF IF')

    result = w
  } else {
    print('in substiotue::: ELSE ELSE')

    const name = string.lower(w)
    const [var_value, var_type]: [string | number, string] = save.get_var(name)
    if (var_type != null && var_type == 'string') {
      add_quotes = true
    }
    if (var_value != null) {
      result = tostring(var_value)
    } else {
      result = w
    }
  }
  if (is_all_capitalized(w) ?? false) {
    result = string.upper(result)
  } else if (after_dot !== '' && (is_capitalized(after_dot) ?? false)) {
    result = capitalize_first(result)
  } else if (is_capitalized(w) ?? false) {
    result = capitalize_first(result)
  }
  if (add_quotes && result != '') {
    result = '"' + result + '"'
  }
  print('SUVSTITUTE result::', result)
  return result
}

function strip_quote(s: string) {
  stripped_quotes.push(s)
  return '__STRIPPED_QUOTE__'
}

function strip_quotes(s: string) {
  stripped_quotes = []
  return string.gsub(s, '["\'][^"\']*["\']', strip_quote)
}

function return_quote(): string {
  const value = stripped_quotes.shift()
  //table.remove(stripped_quotes, 1)
  return value == undefined ? '' : value
}

function return_quotes(s: string) {
  return string.gsub(tostring(s), '__STRIPPED_QUOTE__', return_quote)
}

function execute_string(s: string) {
  Sandbox = {}
  Sandbox = { math: math, vmath: vmath, string: string }
  let stripped: LuaMultiReturn<[string, number]> = strip_quotes(s)
  stripped = string.gsub(
    stripped[0],
    '[%a_][%w_%.]*',
    substitute_in_expression(stripped[0])
  )

  stripped = return_quotes(tostring(stripped[0]))

  const f = loadstring('return ' + stripped[0])

  let result = ''
  if (f[0] !== null) {
    result = assert(f[0])()
  }
  Sandbox = null
  return result
}

function add_escapes(s: string) {
  return string.gsub(s, '%W', '%%%0')
}

// replaces all instances of {x} with value of x
function interpolate_string(s: string) {
  const left = '{'
  const right = '}'
  let _s: LuaMultiReturn<[string, number]> | string = s
  let expression = string.match(s, left + '([^{]*)' + right)
  for (let i = expression.length; i-- !== 0; ) {
    let value = ''
    value = execute_string(expression[i])
    value = tostring(value)
    const pattern = add_escapes(left + expression[i] + right)

    _s = string.gsub(s, tostring(pattern[0]), value)[0]

    expression = string.match(tostring(_s), left + '([^{]+)' + right)
  }

  return _s
}

function jump(args: any) {
  matchascript.jump_to_label(args[0])
}

function fcall(args: any) {
  save.push_call_stack()
  matchascript.jump_to_label(args[0])
}

function action_return() {
  const pop: number = save.pop_call_stack()
  if (pop != undefined) {
    matchascript.jump_to_line(pop)
  }
}

function say(args: any) {
  state = 'say'
  let name
  let text
  if (args.right != undefined) {
    name = args.left
    text = args.right
  } else {
    name = args.name
    text = args.text !== '' ? args.text : args[0]
  }
  // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
  const interpolated_text = interpolate_string(text)
  print('PRE MPRE PERR EPR textboxmessage say :: from mnnvoel say.')
  messages.post('textbox', 'say', { text: interpolated_text, name: name })
  print('post textboxmessage say :: from mnnvoel say.')
  messages.post('choices', 'delete')
  print('post choices deltet msg  :: from mnnvoel say.')
}

function set(args: any) {
  print('0 from mnovel:: args:', args[0])
  print('1 from mnovel:: args:', args[1])
  const name =
    args.left != '' ? args.left : args.name != '' ? args.name : args[0]
  print('name', name)
  const value_string =
    args.right != '' ? args.right : args.value != '' ? args.value : args[1]
  print('value_String', value_string)

  const val_table = matchascript.get_variable(value_string)
  print('typeof valtbl', typeof val_table)
  print(val_table[0], val_table[1], 'all vals table novel')
  let [value, var_type]: [string, string] = val_table
  print(value, var_type, 'value, vartype')

  if (value === null && var_type === null) {
    value = execute_string(tostring(value_string))
    if (value != '' && !Number.isNaN(parseInt(value))) {
      var_type = 'number'
    } else {
      var_type = 'string'
    }
  }
  print('save.set_var(name, value, var_type) FRO<::: matchanovel')
  save.set_var(name, value, var_type)

  // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
  const before_dot = string.match(name, '[%a_][%w_]*')
  // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
  const after_dot = string.match(name, '[%a_][%w_]*$')
  if (before_dot != null) {
    if (before_dot[0] == 'scene') {
      messages.post('background', 'action_set', {
        name: name,
        value,
        value_string: value_string,
      })
    }
  }
  if (after_dot != null) {
    if (after_dot[0] == 'sprite') {
      messages.post('sprites', 'action_set_sprite', {
        name: before_dot[0],
        spr: value,
      })
    }
  }
  print('When does this matchascript .next get called.')
  matchascript.next()
}

function add(args: any) {
  const name =
    args.left != null ? args.left : args.name != null ? args.name : args[0]
  const value_string =
    args.left != null ? args.left : args.name != null ? args.name : args[1]
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [value, _i] = matchascript.get_variable(value_string)
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [value_a, _j] = matchascript.get_variable(name)
  // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
  const value_a_number: number = value_a != undefined ? parseInt(value_a) : 0
  // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
  const value_b_number = value != undefined ? parseInt(value_a) : 0
  const sum = value_a_number + value_b_number
  save.set_var(name, sum)
  matchascript.next()
}

function addone(args: any) {
  const name =
    args.name != null ? args.name : args[1] != null ? args[1] : args[0]
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [v, _] = matchascript.get_variable(name)
  // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
  const value = v != undefined ? parseInt(v) : 0
  const sum = value + 1
  save.set_var(name, sum)[1]
  matchascript.next()
}

function subtract(args: any) {
  const name =
    args.left != null ? args.left : args.name != null ? args.name : args[0]
  const value_string =
    args.right != null ? args.right : args.value != null ? args.value : args[1]
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [value, _i] = matchascript.get_variable(value_string)
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [value_a, _j] = matchascript.get_variable(name)
  // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
  const value_a_number = value_a != undefined ? parseInt(value_a) : 0
  // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
  const value_b_number = value != undefined ? parseInt(value) : 0
  const sum = value_a_number - value_b_number
  save.set_var(name, sum)[1]
  matchascript.next()
}

function scene(args: any) {
  let aKey: keyof typeof args
  for (aKey of args) {
    print('ALL SCENE ARGS::: AKEY::', aKey)
  }
  const scene = args.scene != null ? args.scene : args[0]
  const transition =
    args.transition != null
      ? args.transition
      : save.get_var('scene.transition')[1]

  const duration =
    args.duration != null
      ? args.duration
      : args.t != null
      ? args.t
      : save.get_var('scene.duration')[1]
  /**
   *
   *
   * TESTJPF THESE SHOULD ALL BE NIL!!!!!
   * save.get_vars are fucked probably
   * log each condition path and see what conditions are being met?!?!?!?!?!
   *
   */
  print('durartionm:::', duration)

  print('transition:::', transition)
  //I think theres an issue with these save.get_vars.
  //getting tables as key indexes.  probably poulated wrong.
  //or wrong this??? TESTJPF

  const color = null // args.color != null ? args.color : save.get_var(this,'scene.color')
  print('SCENE::: COLOR::', color)

  const transition_color =
    args.transition_color != null
      ? args.transition_color
      : save.get_var('scene.transition_color')

  save.set_var('scene.current', scene, 'string')
  save.set_var('scene.current_color', color, 'string')
  print('matchanovel::: scene:: color:', color)
  print('matchanovel::: scene:: scene:', scene)
  const message = {
    scene: scene,
    transition: transition,
    duration: duration,
    color: color,
    transition_color: transition_color,
  }
  messages.post('background', 'scene', message)
  matchascript.next()
}

function show(args: any) {
  const name = args[0]
  const at = args.at != null ? args.at : args[1]
  const transition =
    args.transition != null
      ? args.transition
      : save.get_var('show.transition')[1]
  const duration =
    args.duration != null
      ? args.duration
      : args.t != null
      ? args.t
      : save.get_var('show.duration')[1]
  const color = args.color != null ? args.color : save.get_var('show.color')[1]
  const wait = args.wait

  messages.post('sprites', 'show', {
    name: name,
    at: at,
    transition: transition,
    duration: duration,
    color: color,
  })
  if (wait == null) {
    matchascript.next()
  }
}

function hide(args: any) {
  const name = args[0]
  const to = args.to != null ? args.to : args[1]
  const transition =
    args.transition != null
      ? args.transition
      : save.get_var('hide.transition')[1]
  const duration =
    args.duration != null
      ? args.duration
      : args.t != null
      ? args.t
      : save.get_var('hide.duration')
  const wait = args.wait
  messages.post('sprites', 'hide', {
    name: name,
    to: to,
    transition: transition,
    duration: duration,
  })
  print('POST SPRITE  MESSAGE MNOVEL')
  if (wait == null) {
    matchascript.next()
  }
}

function move(args: any) {
  const name = args.name != null ? args.name : args[0]
  const to = args.to != null ? args.to : args[1]
  const duration =
    args.duration != null
      ? args.duration
      : args.t != null
      ? args.t
      : save.get_var('move.duration')[1]
  const wait = args.wait
  messages.post('sprites', 'move', { name: name, to: to, duration: duration })
  if (wait != undefined) {
    matchascript.next()
  }
}

function choice() {
  if (matchascript.current_line_is_start_of_action_block() == true) {
    state = 'choices'
    choices = matchascript.get_current_action_block()
    const text: { [key: string]: string } = {}
    for (const [cKey] of Object.entries(choices)) {
      text[cKey] = matchascript.get_argument(choices[parseInt(cKey)])
    }
    messages.post('choices', 'show_text_choices', { text: text })
    messages.post('textbox', 'hide')
  } else {
    const line = matchascript.get_end_of_current_action_block()
    matchascript.set_line(line)
    matchascript.next()
  }
}

function label() {
  matchascript.next()
}

function none() {
  matchascript.next()
}
function empty() {
  matchascript.next()
}

function action_if_true(v: string) {
  if (v != '') {
    matchascript.next_step()
  } else {
    matchascript.next()
  }
}

function action_if(args: any) {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
  action_if_true(execute_string(args[0]))
}

function saydefault(args: any) {
  say(args)
}

interface scriptDefs {
  actions: string[]
  prefixes: { [key: string]: string }
  suffixes: { [key: string]: string }
  operators: { [key: string]: string }
  functions: { [key: string]: (args: any) => void }
}
const script_definition: scriptDefs = {
  actions: [
    'none',
    'label',
    'jump',
    'set',
    'add',
    'addone',
    'subtract',
    'if',
    'comment',
    'say',
    'show',
    'hide',
    'hideall',
    'move',
    'scene',
    'choice',
    'fcall',
    'return',
    'title',
    'empty',
    'saydefault',
  ],
  prefixes: {
    choice: '>',
    comment: '//',
    label: '*',
    jump: '->',
  },
  suffixes: {
    addone: '++',
    call: '()',
  },
  operators: {
    say: ':',
    add: '+=',
    subtract: '-=',
    set: '=',
  },
  functions: {
    jump: jump,
    set: set,
    say: say,
    show: show,
    hide: hide,
    scene: scene,
    move: move,
    choice: choice,
    fcall: fcall,
    add: add,
    addone: addone,
    subtract: subtract,
    label: label,
    comment: none,
    empty: empty,
    default: saydefault,
    ['return']: action_return,
    ['if']: action_if,
  },
}
//script_definition.extensions = {pronouns}

const render_order = [
  'novel/background',
  //"transition_bg",
  'novel/sprites',
  'novel/textbox',
  'novel/choices',
  //"border",
  'novel/debug',
]
const input_order = ['textbox', 'choices']

function set_render_order() {
  for (let i = 0; i < render_order.length - 1; i++) {
    const extracted = string.match(render_order[i], '/(.*)')
    messages.post(extracted[0], 'set_render_order', { n: i })
  }
}

function set_input_order() {
  for (const gui of input_order) {
    messages.post(gui, 'acquire_input_focus', {})
  }
}

export function novel_init(path: string) {
  if (path != '') {
    matchascript.add_file(path)
  }
  matchascript.set_definition(script_definition)
  set_render_order()
  set_input_order()
  //settings.init()
  matchascript.init()
}

export function novel_start() {
  messages.post('textbox', 'start')
  matchascript.start()
}

export function textbox_done() {
  if (state == 'say') {
    matchascript.next()
  }
}

export function choose(choice: number) {
  matchascript.jump_to_line(parseInt(choices[choice]) + 1)
}

export function set_font(font: string) {
  messages.post('textbox', 'set_font', { font: font })
  messages.post('choices', 'set_font', { font: font })
}

export function get_log(line: number): string {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-return
  return save.get_log(line)
}

export function get_log_size(): number {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-return
  return save.get_log_size()
}

export function add_to_log(text: string, name: string): string {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-return
  return save.add_to_log(text, name)
}
