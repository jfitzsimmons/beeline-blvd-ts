/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
//const matchanovel = require('main.novel.matchanovel')
//const typewriterlib = require('../../../main.novel.typewriter')
//const settings = require "main.novel.settings"
import { novelsave } from '../../types/legacylua'
import { new_typewriter } from './typewriter'
import { add_to_log, get_log, get_log_size, textbox_done } from './matchanovel'
import { Typewriter } from '../../types/novel'

const display_width = tonumber(sys.get_config_string('display.width'))
const display_height = tonumber(sys.get_config_string('display.height'))
const typewriter: Typewriter = new_typewriter()
const alpha = 0.8
const textbox_color_y = 1 / 5
const textbox_gradient_y = 1 / 2
const text_width = 2 / 3
const text_height = 0.3
let skipping = false
let auto = false
let log_position: number | boolean = false
let textbox_visible = true
let name_scale = 1
let window_resized_zoom = 1
//const showing_text = false

function init_textbox() {
  const node_color = gui.get_node('textbox_color')
  const scale = gui.get_scale(gui.get_node('gui'))
  const w = display_width! / scale.x
  const h = display_height! / scale.y

  const size_color = vmath.vector3(
    math.floor(w),
    math.floor(h * textbox_color_y),
    0
  )
  gui.set_size(node_color, size_color)
  gui.set_alpha(node_color, alpha)

  const node_gradient = gui.get_node('textbox_gradient')
  if (textbox_gradient_y != null) {
    gui.set_enabled(node_gradient, true)
    gui.set_size(
      node_gradient,
      vmath.vector3(math.floor(w), math.floor(h * textbox_gradient_y), 0)
    )
    gui.set_position(node_gradient, vmath.vector3(0, size_color.y, 0))
    gui.set_alpha(node_gradient, alpha)
  } else {
    gui.set_enabled(node_gradient, false)
  }

  const node_text = gui.get_node('text')
  const width_border = (1 - text_width) / window_resized_zoom
  const size = vmath.vector3(0, 0, 1)
  size.x = w * (1 - width_border)
  size.y = h * text_height
  const position = vmath.vector3(-size.x / 2, size.y * window_resized_zoom, 0)
  gui.set_size(node_text, size)
  gui.set_position(node_text, position)
}

function set_font(font: hash) {
  gui.set_font(gui.get_node('text'), font)
  gui.set_font(gui.get_node('name'), font)
  typewriter.redraw()
}

function text_continue() {
  //novelsave.set_global_read()

  typewriter.next()
}

function show_name(name: string) {
  const node = gui.get_node('name')
  gui.set_enabled(node, true)
  gui.set_text(node, name)
}

function say(this: any, text: string, name: string) {
  typewriter.start(text)
  add_to_log(text, 'Name')
  let local_name: [string, string] = ['', '']
  if (name !== '') {
    const name_prop = name + '.name'
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
    local_name = novelsave.get_var(name_prop)
  }
  show_name(local_name[0])
}

function end_skip() {
  skipping = false
  msg.post('quickmenu#quickmenu', 'deactivate_button', { name: 'skip' })

  const node = gui.get_node('auto')
  gui.animate(node, 'scale.y', 0, gui.EASING_INOUTSINE, 0.05)
}

function end_auto() {
  auto = false
  gui.set_fill_angle(gui.get_node('auto'), 0)
  msg.post('quickmenu#quickmenu', 'deactivate_button', { name: 'auto' })
}

function start_skip() {
  if (auto) {
    end_auto()
  }
  skipping = true
  //skip_t = 0
  msg.post('quickmenu#quickmenu', 'activate_button', { name: 'skip' })

  const node = gui.get_node('auto')
  gui.set_fill_angle(node, 360)
  gui.set_scale(node, vmath.vector3(1, 1, 1))
  gui.animate(
    node,
    'scale.y',
    0.0001,
    gui.EASING_INOUTSINE,
    0.35,
    0,
    null,
    gui.PLAYBACK_LOOP_PINGPONG
  )
}

function start_auto() {
  if (skipping) {
    end_skip()
  }
  auto = true
  //auto_t = 0
  const node = gui.get_node('auto')
  gui.set_fill_angle(node, 0)
  gui.animate(node, 'scale.y', 1, gui.EASING_INOUTSINE, 0.1)
  msg.post('quickmenu#quickmenu', 'activate_button', { name: 'auto' })
}

function toggle_skip() {
  if (skipping) {
    end_skip()
  } else {
    start_skip()
  }
}

function toggle_auto() {
  if (auto) {
    end_auto()
  } else {
    start_auto()
  }
}

function show() {
  gui.set_enabled(gui.get_node('textbox'), true)
  textbox_visible = true
}

function hide() {
  gui.set_enabled(gui.get_node('textbox'), false)
  textbox_visible = false
}

function set_log(line: number) {
  const text = get_log(line)
  typewriter.set_instant_text(text)
}

function show_log() {
  if (!textbox_visible) {
    gui.set_enabled(gui.get_node('textbox'), true)
  }
  msg.post('choices#choices', 'hide')
}

function hide_log() {
  log_position = false
  if (!textbox_visible) {
    gui.set_enabled(gui.get_node('textbox'), false)
  }
  msg.post('choices#choices', 'unhide')
  typewriter.hide_instant_text()
}

function press_continue() {
  if (typeof log_position == 'number') {
    hide_log()
  } else if (skipping) {
    end_skip()
  } else if (auto) {
    end_auto()
  } else {
    text_continue()
  }
}

function back() {
  if (typeof log_position == 'number') {
    log_position = log_position - 1
    if (log_position < 1) {
      log_position = 1
      return
    }
  } else {
    log_position = get_log_size() - 1
    if (log_position < 1) {
      return
    } else {
      show_log()
    }
  }
  set_log(log_position)
}

function forward() {
  if (typeof log_position == 'number') {
    log_position = log_position + 1
    const n = get_log_size()
    if (log_position >= n) {
      log_position = n
      hide_log()
    } else {
      set_log(log_position)
    }
    //set_log(log_position)
  } else {
    press_continue()
  }
}

function resize_window() {
  init_textbox()
  //gui.set_position(gui.get_node("text"), vmath.vector3(-622, 326 * window_resized_zoom, 0))
  gui.set_position(
    gui.get_node('name'),
    vmath.vector3(-700, 446 * window_resized_zoom, 0)
  )
  const text_zoom = 1 + (window_resized_zoom - 1) / 2
  gui.set_scale(
    gui.get_node('name'),
    vmath.vector3(text_zoom * name_scale, text_zoom * name_scale, 1)
  )
  typewriter.set_scale(text_zoom)
  typewriter.redraw()
}

export function init(this: any) {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
  this.typewriter = new_typewriter()
  msg.post('window_listener#window_listener', 'add_listener')
  gui.set_text(gui.get_node('text'), '')
  name_scale = gui.get_scale(gui.get_node('name')).x
  init_textbox()
  typewriter.init('text')
}

export function on_message(
  this: any,
  messageId: hash,
  message: {
    text: string
    name: string
    font: hash
    zoom: number
    value: number
    n: number
  },
  _sender: url
) {
  if (messageId == hash('say')) {
    show()
    say(message.text, message.name)
    //gui.set_text(gui.get_node("text"), message.text)
  } else if (messageId == hash('typewriter_next')) {
    textbox_done()
  } else if (messageId == hash('set_font')) {
    set_font(message.font)
  } else if (messageId == hash('event_window_resized')) {
    window_resized_zoom = message.zoom
    resize_window()
  } else if (messageId == hash('skip_button')) {
    toggle_skip()
  } else if (messageId == hash('auto_button')) {
    toggle_auto()
  } else if (messageId == hash('set_textspeed')) {
    let textspeed: number
    if (message.value > 0.999) {
      textspeed = 10000
    } else if (message.value > 0.75) {
      textspeed = 100 + (message.value - 0.8) * 240
    } else {
      textspeed = 10 + message.value * 120
    }
    typewriter.set_options({ textspeed: textspeed })
  } else if (messageId == hash('hide')) {
    hide()
  } else if (messageId == hash('set_render_order')) {
    gui.set_render_order(message.n)
  } else if (messageId == hash('loaded')) {
    hide_log()
  }
}

export function on_input(
  this: any,
  action_id: hash,
  action: { pressed: boolean; released: boolean; repeated: boolean }
) {
  if (action_id == hash('continue') && action.pressed) {
    press_continue()
  } else if (action_id == hash('touch') && action.released) {
    press_continue()
  } else if (action_id == hash('skip')) {
    if (action.pressed) {
      start_skip()
    } else if (action.released) {
      end_skip()
    }
  } else if (action_id == hash('toggle_skip') && action.pressed) {
    toggle_skip()
  } else if (action_id == hash('back') && action.repeated) {
    back()
  } else if (action_id == hash('forward') && action.repeated) {
    forward()
  }
}
