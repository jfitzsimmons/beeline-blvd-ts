/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
//const matchanovel = require('main.novel.matchanovel')
import { choose } from './matchanovel'
const distance = 32
const border_x = 32
const border_y = 16
const color_hovered = vmath.vector4(179 / 255, 102 / 255, 128 / 255, 1)
const color_unhovered = vmath.vector4(0.8, 1, 1, 0.9)
const hover_duration = 0.2

let active = false
let pressed_choice: boolean | string = false
let hovered_choice: boolean | string = false
let current_text: { [key: string]: string }
let nodes: any = {}

function get_text_size(node: node, text: string) {
  const font_resource = gui.get_font_resource(gui.get_font(node))
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const metrics: any = resource.get_text_metrics(font_resource, text)
  const text_scale = gui.get_scale(node)
  // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
  const width = metrics.width * text_scale.x
  // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
  const height = metrics.height * text_scale.y
  return [width, height]
}

function delete_choices() {
  let nKey: keyof typeof nodes
  for (nKey in nodes) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-member-access
    gui.delete_node(nodes[nKey]['choice'])
  }
  nodes = {}
  hovered_choice = false
}

function hide_choices() {
  gui.set_enabled(gui.get_node('choices'), false)
}

function unhide_choices() {
  gui.set_enabled(gui.get_node('choices'), true)
}

function create_choices(choices: { [key: string]: string }) {
  delete_choices()
  current_text = choices
  let y = 0
  let nKey: keyof typeof nodes
  for (nKey in nodes) {
    nodes[nKey] = gui.clone_tree(gui.get_node('choice'))
    const node_choice = nodes[nKey]['choice']
    const node_box = nodes[nKey]['choice_box']
    const node_text = nodes[nKey]['choice_text']
    const [text_width, text_height]: number[] = get_text_size(
      node_text,
      nodes[nKey]
    )

    y = y - text_height / 2 - border_y
    gui.set_enabled(node_choice, true)
    gui.set_text(node_text, nodes[nKey])
    gui.set_size(
      node_box,
      vmath.vector3(text_width + 2 * border_x, text_height + 2 * border_y, 0)
    )
    gui.set_position(node_choice, vmath.vector3(0, y, 0))
    gui.set_color(node_box, color_unhovered)
    y = y - text_height / 2 - border_y - distance
  }
  y = y + border_y + distance
  gui.set_position(gui.get_node('choices'), vmath.vector3(0, -y / 2, 0))
}

function pick_choices(choice: string) {
  active = false
  choose(choice)
  delete_choices()
}

function set_font(font: string) {
  gui.set_font(gui.get_node('choice_text'), font)
  if (active) {
    delete_choices()
    create_choices(current_text)
  }
}

function unhover_choice() {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const node: node = nodes[tostring(hovered_choice)]['choice_box']
  gui.animate(
    node,
    'color',
    color_unhovered,
    gui.EASING_INOUTSINE,
    hover_duration
  )
  hovered_choice = false
}

function hover_choice(choice: string) {
  if (hovered_choice != false) {
    unhover_choice()
  }
  hovered_choice = choice
  const node = nodes[choice]['choice_box']
  gui.animate(
    node,
    'color',
    color_hovered,
    gui.EASING_INOUTSINE,
    hover_duration
  )
}

export function init(this: any) {
  msg.post('window_listener#window_listener', 'add_listener')
}

export function on_message(
  this: any,
  message_id: hash,
  message: { text: any; font: string; zoom: number; n: number },
  _sender: url
) {
  if (message_id == hash('show_text_choices')) {
    const choices: { [key: string]: string } = {}

    let tKey: keyof typeof message.text
    for (tKey in message.text) {
      choices[tKey] = message.text[tKey][0]
    }
    create_choices(choices)
    active = true
  } else if (message_id == hash('set_font')) {
    set_font(message.font)
  } else if (message_id == hash('delete')) {
    delete_choices()
  } else if (message_id == hash('hide')) {
    hide_choices()
  } else if (message_id == hash('unhide')) {
    unhide_choices()
  } else if (message_id == hash('event_window_resized')) {
    //window_resized_zoom = message.zoom
    const scale = vmath.vector3(message.zoom, message.zoom, 1)
    gui.set_scale(gui.get_node('center'), scale)
  } else if (message_id == hash('set_render_order')) {
    gui.set_render_order(message.n)
  } else if (message_id == hash('loaded')) {
    unhide_choices()
  }
}

export function on_input(
  this: any,
  action_id: hash,
  action: {
    pressed: boolean
    released: boolean
    repeated: boolean
    x: number
    y: number
  }
) {
  if (!active) {
    return
  }

  if (action_id == null) {
    if (hovered_choice == true) {
      const node = nodes[tostring(hovered_choice)]['choice_box']
      if (!gui.pick_node(node, action.x, action.y)) {
        unhover_choice()
      }
    } else {
      let nKey: keyof typeof nodes
      for (nKey in nodes) {
        const node = nodes[nKey]['choice_box']
        if (gui.pick_node(node, action.x, action.y)) {
          hover_choice(nKey)
        }
      }
    }
  } else if (action_id == hash('touch')) {
    if (action.pressed) {
      let nKey: keyof typeof nodes
      for (nKey in nodes) {
        if (gui.pick_node(nodes[nKey]['choice_box'], action.x, action.y)) {
          pressed_choice = nKey
        }
      }
    } else if (action.released) {
      if (
        pressed_choice != false &&
        gui.pick_node(
          nodes[tostring(pressed_choice)]['choice_box'],
          action.x,
          action.y
        )
      ) {
        pick_choices(tostring(pressed_choice))
      }
      pressed_choice = false
    }
  }
}
