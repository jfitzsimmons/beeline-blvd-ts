/* eslint-disable @typescript-eslint/strict-boolean-expressions */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */

import { Typewriter } from '../../types/novel'
//import { toFixed } from '../../types/utils'

let typewriters: { [key: number]: Typewriter } = {}
let current: Typewriter

const v3 = vmath.vector3
const string_sub = string.sub
const string_byte = string.byte
//const string_find = string.find

// Defold functions
const gui_animate = gui.animate
const gui_clone = gui.clone
const gui_cancel_animation = gui.cancel_animation
const gui_delete_node = gui.delete_node
const gui_get_font = gui.get_font
const gui_get_font_resource = gui.get_font_resource
const gui_get_node = gui.get_node
const gui_get_size = gui.get_size
const gui_set_alpha = gui.set_alpha
const gui_get_alpha = gui.get_alpha
const gui_set_line_break = gui.set_line_break
const gui_set_parent = gui.set_parent
const gui_get_position = gui.get_position
const gui_set_position = gui.set_position
const gui_set_scale = gui.set_scale
//const gui_get_scale = gui.get_scale
const gui_set_size = gui.set_size

//const gui_get_text = gui.get_text
const gui_set_text = gui.set_text
//const gui_get_id = gui.get_id
const resource_get_text_metrics = resource.get_text_metrics

// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
const EASING_LINEAR = gui.EASING_LINEAR

function animate_alpha(
  node: node,
  to: number,
  duration: number,
  delay: number,
  done?: () => void
) {
  gui_animate(node, 'color.w', to, EASING_LINEAR, duration, delay, done)
}

function letters_animated() {
  if (current.state == 'typing') {
    current.state = 'waiting'
  }
}

function animate_letter(node: node, delay: number, last?: boolean) {
  if (last === true) {
    animate_alpha(node, 1, current.letter_fadein, delay, letters_animated)
  } else {
    animate_alpha(node, 1, current.letter_fadein, delay)
  }
}

function fade_done() {
  current.state = 'empty'
  print('FADEDONETW')
  //auto = false
  msg.post('#textbox', 'typewriter_next')
}

function fade_letter(node: node, delay: number, last?: boolean) {
  if (last === true) {
    animate_alpha(node, 0, current.letter_fadeout, delay, fade_done)
  } else {
    animate_alpha(node, 0, current.letter_fadeout, delay)
  }
}

function get_utf8_length(s: string) {
  const c = string_byte(s)
  if (c <= 0) {
    return 1
  } else if (c <= 127) {
    return 1
  } else if (194 <= c && c <= 223) {
    return 2
  } else if (224 <= c && c <= 239) {
    return 3
  } else if (240 <= c && c <= 244) {
    return 4
  } else {
    return 1
  }
}

// is the character a Chinese, Japanese, or Korean character (or other with utf8_length of 3)
function is_cjk(char: string) {
  const c = string_byte(char)
  return 223 < c && c < 245
}

function create_character_table(text: string) {
  const character_table = []
  let n = text.length
  while (!Number.isNaN(n) && n > 0) {
    const first = string_sub(text, 0, 1)
    const utf8_length = get_utf8_length(first)
    const length = math.min(utf8_length, n)
    const character = string_sub(text, 0, length)
    text = string_sub(text, length + 1)
    n = text.length
    character_table.push(character)
  }
  return character_table
}

function get_letter(n: number) {
  if (current.letter_nodes[n] == undefined) {
    current.letter_nodes[n] = gui_clone(current.node)
    gui_set_parent(current.letter_nodes[n], current.parent, false)
  }
  return current.letter_nodes[n]
}

function delete_letters() {
  let nodeKey: keyof typeof current.letter_nodes
  for (nodeKey in current.letter_nodes) {
    gui_delete_node(current.letter_nodes[nodeKey])
  }
  current.letter_nodes = {}

  if (current.instant_node) {
    gui_delete_node(current.instant_node)
    current.instant_node = null
  }
}

function set_letters(line_table: { [key: string]: string }, instant: boolean) {
  let nodeKey: keyof typeof current.letter_nodes
  for (nodeKey in current.letter_nodes) {
    const node = current.letter_nodes[nodeKey]
    gui_cancel_animation(node, 'color.w')
    gui_set_alpha(node, 0)
    gui_set_text(node, '')
  }

  const font_resource = gui_get_font_resource(gui_get_font(current.node))
  let text = 'X'
  let metrics: {
    width: number
    height: number
  } = resource_get_text_metrics(font_resource, text)
  let height = metrics.height
  const width = metrics.width

  if (current.line_spacing_scale != null) {
    height = height * current.line_spacing_scale
  }

  let n_letters = 0
  let lKey: keyof typeof line_table
  for (lKey in line_table) {
    const line = line_table[lKey]
    text = ''
    const character_table = create_character_table(line)
    for (const character of character_table) {
      n_letters = n_letters + 1
      metrics = resource_get_text_metrics(font_resource, text + 'X')
      const letter = get_letter(n_letters) //sets letter_nodes
      gui_set_text(letter, character)
      gui_cancel_animation(letter, 'position')
      gui_cancel_animation(letter, 'color.w')
      gui_set_position(
        letter,
        v3(metrics.width - width, (1 - parseInt(lKey)) * height, 0)
      )
      gui_set_scale(letter, v3(1, 1, 1))
      if (instant) {
        gui_set_alpha(letter, 1)
      } else {
        gui_set_alpha(letter, 0)
        animate_letter(
          letter,
          (n_letters - 1) / current.textspeed,
          parseInt(lKey) == Object.entries(line_table).length &&
            n_letters - 1 == character_table.length
        )
      }
      text = text + character
    }
  }
  print('TYPEWRITER:: SETLETTERS:: instatn,neltter:', instant, n_letters)
  //  if (instant == true || n_letters == chara) {
  current.state = 'waiting'
  //  }
}

function reposition_letters(line_table: { [key: string]: string }) {
  if (Object.entries(line_table).length <= 0) {
    return
  }

  const font_resource = gui_get_font_resource(gui_get_font(current.node))
  let text = 'X'
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  let metrics: {
    width: number
    height: number
  } = resource_get_text_metrics(font_resource, text)
  let height = metrics.height
  const width = metrics.width

  if (current.line_spacing_scale != null) {
    height = height * current.line_spacing_scale
  }

  let n_letters = 0
  let lKey: keyof typeof line_table
  for (lKey in line_table) {
    const line = line_table[lKey]
    text = ''
    const character_table = create_character_table(line)
    for (const character of character_table) {
      n_letters = n_letters + 1
      metrics = resource_get_text_metrics(font_resource, text + 'X')
      const letter = get_letter(n_letters)
      gui_animate(
        letter,
        'position',
        v3(metrics.width - width, (1 - parseInt(lKey)) * height, 0),
        EASING_LINEAR,
        current.zoom_speed
      )
      text = text + character
    }
  }
}

function get_next_space(text: string) {
  let next_space = 1
  const _c = text.split('')

  for (const c of _c) {
    if (is_cjk(c)) {
      return next_space + get_utf8_length(c) - 1
    } else if (c == ' ') {
      return next_space
    } else {
      next_space = next_space + 1
    }
  }
  return next_space
}

function split_text_into_lines(text: string, max_width: number) {
  const font_resource = gui_get_font_resource(gui_get_font(current.node))
  const options = { line_break: true }
  let metrics: {
    width: number
    height: number
  } = resource_get_text_metrics(font_resource, text, options)
  let lines = 1
  let first = true
  const text_table: { [key: string]: string } = {}
  text_table[1] = ''
  let next_word
  while (metrics.width > max_width && next_word != '') {
    const next_space = get_next_space(text)
    next_word = string_sub(text, 0, next_space)
    const line_metrics: {
      width: number
      height: number
    } = resource_get_text_metrics(
      font_resource,
      text_table[lines] + next_word,
      options
    )
    if (line_metrics.width > max_width && !first) {
      lines = lines + 1
      text_table[lines] = next_word
      text = string_sub(text, next_space + 1)
      if (next_word == '') {
        metrics = resource_get_text_metrics(font_resource, text, options)
      } else {
        metrics = resource_get_text_metrics(
          font_resource,
          text + ' ' + next_word,
          options
        )
      }
    } else {
      text_table[lines] = text_table[lines] + next_word
      text = string_sub(text, next_space + 1)
      first = false
    }
  }
  text_table[lines] = text_table[lines] + text
  return text_table
}

function start_typewriter(text: string, instant: boolean) {
  print('STARTTYPEWWRITER:: instatn:', instant, text)
  text = text.length > 0 ? text : ''
  current.state = 'typing'
  current.text = text

  const width = gui_get_size(current.node).x / current.scale
  const lines = split_text_into_lines(text, width)
  set_letters(lines, instant)
}

function end_typewriter() {
  let nodeKey: keyof typeof current.letter_nodes
  for (nodeKey in current.letter_nodes) {
    const node = current.letter_nodes[nodeKey]
    animate_letter(node, 0)
  }
  current.state = 'waiting'
}
function archive_text() {
  const textNodes: {
    [key: string]: { clone: node }
  } = {}
  let nodeKey: keyof typeof current.letter_nodes
  //testjpf
  //you could add properties to this like
  //animationComplete
  //so textNodes[nodeKey].clone = guiclone()
  //textNodes[nodeKey].animationComplete = false
  for (nodeKey in current.letter_nodes) {
    textNodes[nodeKey] = {
      clone: gui_clone(current.letter_nodes[nodeKey]),
      // animationComplete: false,
    }
    gui_set_alpha(textNodes[nodeKey].clone, 1)
  }

  current.archive.push(textNodes)
  //current.archive.animationComplete = false
  for (const tns of current.archive) {
    let nodeKey: keyof typeof tns
    for (nodeKey in tns) {
      const node = tns[nodeKey]
      // print('preenode.animationComplete::', node.animationComplete)

      raise_letter(node)
    }
  }

  //current.archive.animationComplete = true
}
function raise_letter(node: { clone: node }) {
  //testjpf
  //then here we'd need node.clone
  //(maybe name better than node? nodeProps?.clone)

  const pos = gui_get_position(node.clone)
  const width = gui_get_size(node.clone).x / current.scale
  const metrics: {
    width: number
    height: number
  } = resource_get_text_metrics(
    gui_get_font_resource(gui_get_font(node.clone)),
    current.text
  )
  //const y = gui_get_size(node).y
  print(
    'ISYBIGGER??',
    metrics.width,
    width,
    math.ceil(metrics.width / width),
    metrics.height * math.ceil(metrics.width / width)
  )
  // const scale = toFixed(gui_get_scale(node.clone).x)
  //print('0000::: node.animationComplete::', node.animationComplete)

  // const testjpf = gui_get_node(node.clone)

  //const scale = gui_get_scale(node.clone)
  /**
   *
   * TESTJPF
   * WARNING:GUI: Out of animation resources (1024)
   * also for some reason just breaks with logic in txts
   * at least thats what i think is going on
   * 
  gui_animate(
    node.clone,
    'scale',
    v3(scale.x - 0.05, scale.y - 0.05, 1),
    EASING_LINEAR,
    0.2,
    0
  )
  */
  gui_animate(
    node.clone,
    'position',
    v3(pos.x, pos.y + metrics.height * math.ceil(metrics.width / width), 0),
    EASING_LINEAR,
    0.2,
    0
    //something like::
  )

  gui_animate(
    node.clone,
    'color.w',
    gui_get_alpha(node.clone) - 0.1,
    EASING_LINEAR,
    0.2,
    0
    //  () => setAnimComplete(node)
  )
  //fart()
  // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
  //  print(`postnode.animationComplete::, ${node.animationComplete}`)

  //animate_alpha(node, gui_get_alpha(node) - 0.1, 0.3, 0.3)

  // gui_set_position
}

function fade_away() {
  current.state = 'fade_away'
  archive_text()
  /**
   * testjpf
   * archive_letternodes()
   * move all previous entrees up if they exist
   * else add new entry
   * and animate it up
   */
  let nodeKey: keyof typeof current.letter_nodes
  for (nodeKey in current.letter_nodes) {
    const node = current.letter_nodes[nodeKey]
    fade_letter(
      node,
      0,
      parseInt(nodeKey) == Object.entries(current.letter_nodes).length - 1
    )
  }
}

function local_clear() {
  let nodeKey: keyof typeof current.letter_nodes
  for (nodeKey in current.letter_nodes) {
    const node = current.letter_nodes[nodeKey]
    fade_letter(node, 0)
  }
  current.state = 'waiting'
}

export function new_typewriter(_options?: any): Typewriter {
  typewriters = {}
  const options: any = _options ? _options : {}
  const new_writer: any = {}
  new_writer.state = 'inactive'
  new_writer.textspeed = options.textspeed || 70
  new_writer.letter_fadein = options.letter_fadein || 0.2
  new_writer.letter_fadeout = options.letter_fadeout || 0.2
  new_writer.line_spacing_scale = options.line_spacing_scale || 1
  new_writer.zoom_speed = 0.15
  new_writer.scale = 1
  new_writer.node = null
  new_writer.auto = false
  new_writer.letter_nodes = {}
  new_writer.archive = []
  new_writer.init = init
  new_writer.set_node = set_node
  new_writer.set_options = set_options
  new_writer.change_typewriter = change_typewriter
  new_writer.start = start
  new_writer.set_instant_text = set_instant_text
  new_writer.hide_instant_text = hide_instant_text
  new_writer.next = next
  new_writer.clear = clear
  new_writer.reposition = reposition
  new_writer.set_scale = set_scale
  new_writer.redraw = redraw
  new_writer.get_state = get_state
  new_writer.zoom = zoom
  const id: number = Object.entries(typewriters).length + 1
  typewriters[id] = new_writer
  current = new_writer

  return typewriters[id]
}

// Set the name of the text node that typewriter uses as base.
export function set_node(id: string) {
  // current.node = null
  //current.parent = null
  current.node = gui_get_node(id)
  current.parent = gui_clone(current.node)
  gui_set_parent(current.parent, current.node, true)
  gui_set_scale(current.parent, v3(1, 1, 1))
  gui_set_text(current.parent, '')
}

// Change options.
// textspeed, letter_fadein, letter_fadeout, line_spacing_scale, zoom_speed
export function set_options(options: any) {
  if (options == null) {
    return
  }
  current.textspeed = options.textspeed ? options.textspeed : current.textspeed
  current.letter_fadein = options.letter_fadein
    ? options.letter_fadein
    : current.letter_fadein
  current.letter_fadeout = options.letter_fadeout
    ? options.letter_fadeout
    : current.letter_fadeout
  current.line_spacing_scale = options.line_spacing_scale
    ? options.line_spacing_scale
    : current.line_spacing_scale
  current.zoom_speed = options.zoom_speed
    ? options.zoom_speed
    : current.zoom_speed
}

// Initialize typewriter on node_id, optional options.
export function init(node_id: string, options: any) {
  set_node(node_id)
  if (options != null) {
    set_options(options)
  }
}

// If you use the typewriter on different text nodes, you can change it by providing the id returned by new()
export function change_typewriter(id: number) {
  current = typewriters[id]
}

// Clears old text && starts typing.
function start(text: string) {
  print('Typewriter:: start(): text:', text)
  start_typewriter(text, false)
}

function add_line_breaks(text: string, max_width: number) {
  const text_lines = split_text_into_lines(text, max_width)
  let text_with_lines_breaks
  let first_line = true

  let lKey: keyof typeof text_lines
  for (lKey in text_lines) {
    const line = text_lines[lKey]

    //for k, v in pairs(text_lines) do
    if (first_line) {
      text_with_lines_breaks = line
      first_line = false
    } else {
      text_with_lines_breaks = text_with_lines_breaks + '\n' + line
    }
  }
  return text_with_lines_breaks
}

let instant_text: string | boolean

export function set_instant_text(text: string) {
  instant_text = text
  const duration = 0.1
  if (!current.instant_node) {
    current.instant_node = gui_clone(current.node)
    gui_set_parent(current.instant_node, current.node)
    gui_set_scale(current.instant_node, v3(current.scale, current.scale, 1))
    gui_set_position(current.instant_node, v3(0, 0, 0))
    gui_set_size(
      current.instant_node,
      v3(gui_get_size(current.node) / current.scale)
    )
    gui_set_line_break(current.instant_node, true)
  }
  gui_set_alpha(current.instant_node, 1)
  gui_set_alpha(current.parent, 0)

  const max_width = gui_get_size(current.instant_node).x
  let text_with_lines_breaks = null
  if (typeof text == 'string')
    text_with_lines_breaks = add_line_breaks(text, max_width)

  if (text_with_lines_breaks != null)
    gui_set_text(current.instant_node, text_with_lines_breaks)

  //[[
  current.instant_node = gui_clone(current.node)
  gui_set_text(current.instant_node, text)
  gui_set_alpha(current.instant_node, 0)
  animate_alpha(current.parent, 0, duration, 0)
  animate_alpha(current.instant_node, 1, duration, duration)
  //]]
}

export function hide_instant_text() {
  if (current.instant_node) {
    gui_delete_node(current.instant_node)
    current.instant_node = null
  }
  instant_text = false
  //animate_alpha(current.parent, 1, 0.2, 0, null)
  gui_set_alpha(current.parent, 1)
}

// Finishes current text if still typing, removes text && asks for next text if already typed.
export function next() {
  //testjpf probably not using typing.
  //because of setletters
  if (current.state == 'typing') {
    print('ENDTW:: typewriter:', current.state)
    end_typewriter()
  } else if (current.state == 'waiting') {
    print('FADEAWAY:: typewriter:', current.state)
    fade_away()
  }
}

// Clears current text from textbox without asking for next action.
export function clear() {
  local_clear()
}

// Repositions the currently typed text, respecting changed zoom && width.
export function reposition() {
  if (current != null && current.text != null) {
    const width = gui_get_size(current.node).x / current.scale
    const lines = split_text_into_lines(current.text, width)
    reposition_letters(lines)
  }
}

export function redraw(instant: boolean) {
  delete_letters()
  if (instant_text) {
    set_instant_text(tostring(instant_text))
  }
  if (current.state == 'empty') {
    return
  }
  start_typewriter(current.text, instant)
}

export function set_scale(scale: number) {
  current.scale = scale
  gui_set_scale(current.parent, v3(scale, scale, 1))
}

// Change zoom of text while keeping same line width.
export function zoom(scale: number) {
  current.scale = scale
  gui_animate(
    current.parent,
    'scale',
    v3(scale, scale, 1),
    EASING_LINEAR,
    current.zoom_speed
  )
  reposition()
}

// Get the current state of the typewriter.
// "inactive": typewrite is not in use
// "typing": typewriter is not yet finished typing the current text
// "waiting": typewriter is finished typing the current text && waits for next action

function get_state() {
  return current.state
}
