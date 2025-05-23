/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { matchascript, novelsave, messages } from '../../types/legacylua'
//const messages = require('../../../main.novel.engine.defold.messages')
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
  let result = ''
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [before_dot, after_dot] = string.match(
    w,
    '([%a_][%w_]*)%.([%a_][%w_]*)'
  )
  const is_in_lib = before_dot !== '' && Sandbox[before_dot]
  print(
    'substitute_in_expression:: before_dot, after_dot:',
    before_dot,
    after_dot,
    '| is_in_lib',
    is_in_lib
  )

  //const is_in_lib = before_dot && Sandbox[before_dot]
  let add_quotes = false
  //if (before_dot == "system" && after_dot ){
  //	result = sysget(after_dot) || ""
  //	add_quotes = true
  //} else
  if (is_in_lib == true || w == '__STRIPPED_QUOTE__') {
    print('RESULTddd000:::', result, w, is_in_lib)
    result = w
    print('RESULTddd111:::', result, w)
  } else {
    const name = string.lower(w)
    const [var_value, var_type]: [string | number, string] =
      novelsave.get_var(name)
    if (var_type != null && var_type == 'string') {
      add_quotes = true
    }
    print('RESULTEEE000:::', result, w, name, var_value, var_type)
    if (var_value != null) {
      result = tostring(var_value)
    } else {
      result = w
    }
    print('RESULTEEE111:::', result, w)
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
  print('RETURN!!!!RESULT:::', result, w)

  return result
}

function strip_quote(s: string) {
  stripped_quotes = []
  stripped_quotes.push(s)
  return '__STRIPPED_QUOTE__'
}

function strip_quotes(s: string) {
  return string.gsub(s, '["\'][^"\']*["\']', function (x) {
    return strip_quote(x)
  })
}

function return_quote(): string {
  const value = stripped_quotes.pop()
  return value == undefined ? '' : value
}

function return_quotes(s: string) {
  return string.gsub(tostring(s), '__STRIPPED_QUOTE__', return_quote)
}

function execute_string(s: string) {
  Sandbox = {}
  Sandbox = { math: math, vmath: vmath, string: string }
  //print('exe stri::: S::', s)

  let stripped: LuaMultiReturn<[string, number]> = strip_quotes(s)
  //print('exe stri::: string1::', stripped[0])

  stripped = string.gsub(stripped[0], '[%a_][%w_%.]*', function (x) {
    return substitute_in_expression(x)
  })
  //print('exe stri::: string2::', stripped[0])

  stripped = return_quotes(tostring(stripped[0]))
  //print('exe stri::: string3::', stripped[0])

  const f = loadstring('return ' + stripped[0])

  let result = ''
  if (f[0] !== null) {
    result = assert(f[0])()
  }
  Sandbox = null
  //print('exe stirng result::', result)
  return result
}

function add_escapes(s: string) {
  return string.gsub(s, '%W', '%%%0')
}

// replaces all instances of {x} with value of x
function interpolate_string(s: string) {
  const left = '{'
  const right = '}'
  //let _s: LuaMultiReturn<[string, number]> | string = s
  let expression = string.match(s, left + '([^{]*)' + right)
  for (let i = expression.length; i-- !== 0; ) {
    let value = ''
    value = execute_string(expression[i])
    value = tostring(value)
    const pattern = add_escapes(left + expression[i] + right)

    s = string.gsub(s, tostring(pattern[0]), value)[0]

    expression = string.match(tostring(s), left + '([^{]+)' + right)
  }
  return s
}

function jump(args: any) {
  matchascript.jump_to_label(args[0])
}

function fcall(args: any) {
  novelsave.push_call_stack()
  matchascript.jump_to_label(args[0])
}

function action_return() {
  const pop: number = novelsave.pop_call_stack()
  if (pop != undefined) {
    matchascript.jump_to_line(pop)
  }
}

//testjpf todo now!!!::: capy back over with origin lua
function say(args: any) {
  state = 'say'
  let name: string | null = null
  let expression_name: string | null = null
  print(
    'MNOVELSAY:::args.left/right::',
    args.left,
    args.right,
    args.name,
    args.text,
    args[0]
  )
  //testjpf
  //if (args.right != undefined) {
  name = args.left
  const text = args.right
  //} else {
  // name = args.name
  // text = args.text !== '' ? args.text : args[0]
  //}
  // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
  const interpolated_text = interpolate_string(text)
  print('MNOVELNAME:::000::', name)
  if (name !== null) {
    const [before_dot, after_dot] = string.match(name, '(.*)%.([^%.]*)$')
    //prettier-ignore
    //print('MNOVELNAME:::!!!::[before_dot, after_dot]',name,before_dot,after_dot )
    // name = novelsave.get_var(name + '.name')[1]
    print('MNOVELNAME:::!!!::GETVAR!!!:', name)
    if (before_dot !== null && after_dot !== null) {
      name = before_dot
      print('MNOVELNAME:::111::', name, after_dot)
      const expression = after_dot
      const sprite = novelsave.get_var(name + '.' + expression + '.sprite')
      //name = string.lower(name)
      print('MNOVELNAME:::222::', name, expression)
      if (sprite != null) {
        print('MNOVELNAME:::2b2b2b:: sprite != null:', name, expression)
        novelsave.set_var('_temp_expression_name', name, 'string')
        novelsave.set_var('_temp_expression_sprite', expression, 'string')
        messages.post('sprites', 'set_sprite', { name: name, sprite: sprite })
      } else {
        print('MNOVELNAME:::2c2c2c:: spriteEXISTS:', name, expression)

        messages.post('sprites', 'set_sprite', {
          name: name,
          sprite: expression,
        })
      }
      expression_name = novelsave.get_var(name + '.' + expression + '.name')
      if (expression_name !== null) {
        name = expression_name
      }
      print('MNOVELNAME:::333::', name)
    }
    //if (expression_name == null) {
    // const expression = novelsave.get_var(name + '.expression')
    // if (expression !== null) {
    //   expression_name = novelsave.get_var(name + '.' + expression + '.name')
    //  if (expression_name !== null) {
    //    name = expression_name
    // }
    //}
    // }
  }
  print('MNOVELNAME:::444::', name)
  messages.post('textbox', 'say', {
    text: interpolated_text,
    name: novelsave.get_var(name + '.name')[1],
  })
  messages.post('choices', 'delete')
}

function set(args: any) {
  const name =
    args.left != '' ? args.left : args.name != '' ? args.name : args[0]
  const value_string =
    args.right != '' ? args.right : args.value != '' ? args.value : args[1]
  //testjpf use a ne novel utils
  //combined with novesave module!!::??
  const val_table = matchascript.get_variable(value_string)
  let [value, var_type]: [string, string] = val_table

  if (value === null && var_type === null) {
    value = execute_string(tostring(value_string))
    if (value != '' && tonumber(value) != undefined) {
      var_type = 'number'
    } else {
      var_type = 'string'
    }
  }
  print('MNSET::: name, value, var_type::', name, value, var_type)
  novelsave.set_var(name, value, var_type)
  //MNSET::: 	room.image	haikeisozai_tatemono4.jpg	string
  // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
  const before_dot = string.match(name, '[%a_][%w_]*')
  // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
  const after_dot = string.match(name, '[%a_][%w_]*$')
  print(
    'MNSET::: BEFOREAFTER:::',
    before_dot[0],
    after_dot[0],
    name,
    value,
    var_type,
    value_string
  )

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
  matchascript.next()
}

function add(args: any) {
  const name =
    args.left != null ? args.left : args.name != null ? args.name : args[0]
  const value_string =
    args.left != null ? args.left : args.name != null ? args.name : args[1]
  //testjpf remove all getvars
  //maybe more replace with utils/ novelsave
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [value, _i] = matchascript.get_variable(value_string)
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [value_a, _j] = matchascript.get_variable(name)
  // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
  const value_a_number: number = value_a != undefined ? parseInt(value_a) : 0
  // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
  const value_b_number = value != undefined ? parseInt(value_a) : 0
  const sum = value_a_number + value_b_number
  novelsave.set_var(name, sum)
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
  novelsave.set_var(name, sum)[1]
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
  novelsave.set_var(name, sum)[1]
  matchascript.next()
}

function scene(args: any) {
  const scene = args.scene != null ? args.scene : args[0]
  const transition =
    args.transition != null
      ? args.transition
      : novelsave.get_var('scene.transition')[1]
  const duration =
    args.duration != null
      ? args.duration
      : args.t != null
      ? args.t
      : novelsave.get_var('scene.duration')[1]
  const color = null
  const transition_color =
    args.transition_color != null
      ? args.transition_color
      : novelsave.get_var('scene.transition_color')

  novelsave.set_var('scene.current', scene, 'string')
  novelsave.set_var('scene.current_color', color, 'string')

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
  print('MATCHANOVEL:: SHOW:: ARGS0/1:', args[0], args[1])
  const name = args[0]
  const at = args.at != null ? args.at : args[1]
  const transition =
    args.transition != null
      ? args.transition
      : novelsave.get_var('show.transition')[1]
  const duration =
    args.duration != null
      ? args.duration
      : args.t != null
      ? args.t
      : novelsave.get_var('show.duration')[1]
  const color =
    args.color != null ? args.color : novelsave.get_var('show.color')[1]
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
      : novelsave.get_var('hide.transition')[1]
  const duration =
    args.duration != null
      ? args.duration
      : args.t != null
      ? args.t
      : novelsave.get_var('hide.duration')
  const wait = args.wait
  messages.post('sprites', 'hide', {
    name: name,
    to: to,
    transition: transition,
    duration: duration,
  })
  //  print('POST SPRITE  MESSAGE MNOVEL')
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
      : novelsave.get_var('move.duration')[1]
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
      const words = [...matchascript.get_argument(choices[parseInt(cKey)])]
      text[cKey] = words.join(' ')
    }

    messages.post('choices', 'show_text_choices', { text: text })
    // messages.post('textbox', 'hide')
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

function action_if_true(v: string | boolean) {
  if (v != false && v != 'false') {
    matchascript.next_step()
  } else {
    matchascript.next()
  }
}

function action_if(args: any) {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
  action_if_true(execute_string(args[0]))
}
function set_expression(name: string, expression: string) {
  if (expression !== null) {
    if (expression == 'default') {
      novelsave.set_var(name + '.expression', null)
    } else {
      novelsave.set_var(name + '.expression', expression)
    }
  }
}
//   function has_alternative_sprite(name:string, expression:string){
//const filename = "/assets/images/sprites/"+name+"_"+expression+".png"
//	if (images.exists(filename) ){
//	return filename
//  }
// }
//TESTJPF DELETE ALL THIS
/**EVERYTHING needs review */
function check_for_statement_function(str: string): boolean {
  print('ISESETEZPRESSIONUSEDATALL???!!!', str)

  const s = string.lower(str)
  let found_statement_function = false

  const [before_dot, after_dot] = string.match(
    s,
    '([%a_][%w_]*)%.([%a_][%w_]*)'
  )

  if (before_dot !== null) {
    const statement_sprite = novelsave.get_var(s + '.sprite')
    const statement_name = novelsave.get_var(s + '.name')
    const statement_color = novelsave.get_var(s + '.color')

    if (after_dot == 'default') {
      set_expression(before_dot, after_dot)
      found_statement_function = true
      const args = { name: before_dot, color: 'white', wait: true }
      show(args)
      // TODO: change no not show, but only change color (but) { check at next show for name.expression.color)
      //   }else if( after_dot == "flip") {
      //		flip_sprite(before_dot)
      //	found_statement_function = true
    }

    if (statement_sprite !== null) {
      set_expression(before_dot, after_dot)
      //change_sprite(before_dot, statement_sprite)
      messages.post('sprites', 'set_sprite', {
        name: before_dot,
        sprite: statement_sprite,
      })
      found_statement_function = true
    } //else if( has_alternative_sprite(before_dot, after_dot)) {
    //set_expression(before_dot, after_dot)
    //change_sprite(before_dot, after_dot)
    ////  messages.post('sprites', 'set_sprite', {
    //    name: before_dot,
    //    sprite: after_dot,
    //  })
    //	found_statement_function = true
    //}

    if (statement_name !== null) {
      set_expression(before_dot, after_dot)
      found_statement_function = true
    }
    if (statement_color !== null) {
      const name = before_dot
      const args = { name: name, color: statement_color, wait: true }
      show(args)
      set_expression(name, after_dot)
      novelsave.set_var(name + '.color', statement_color)
      found_statement_function = true
    }
  }

  //if( _fmod && _fmod.check_for_statement(s)) {
  //	found_statement_function = true
  //}

  return found_statement_function
}
function saydefault(args: any) {
  print('ISSAYDEFAULTEVERUSED????')
  // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
  if (check_for_statement_function(args[0])) {
    matchascript.next()
  } else say(args)
}

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

export function novel_init(paths: string[]) {
  if (paths.length > 0) {
    matchascript.add_files(paths)
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
  return novelsave.get_log(line)
}

export function get_log_size(): number {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-return
  return novelsave.get_log_size()
}

export function add_to_log(text: string, name: string): string {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-return
  return novelsave.add_to_log(text, name)
}
