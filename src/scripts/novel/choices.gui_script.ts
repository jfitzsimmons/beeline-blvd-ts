/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
//const matchanovel = require('main.novel.matchanovel')
import { choose } from './matchanovel'
const distance = 24
const border_x = 24
const border_y = 8
const color_hovered = vmath.vector4(179 / 255, 1, 128 / 255, 1)
const color_unhovered = vmath.vector4(221 / 255, 1, 170 / 255, 1)
const hover_duration = 0.2

let active = false
let pressed_choice: boolean | number = false
let hovered_choice: boolean | number = false
let current_text: { [key: number]: string }
interface ChoiceNodes {
  choice: node
  box: node
  text: node
}
let nodes: { [key: number]: ChoiceNodes } = {}

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
  for (const [nKey] of Object.entries(nodes)) {
    gui.delete_node(nodes[parseInt(nKey)].choice)
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

function create_choices(choices: { [key: number]: string }) {
  delete_choices()
  current_text = choices
  let y = 0

  for (const [nKey] of Object.entries(choices)) {
    const choiceLookup = {
      choice: {},
      box: {},
      text: {},
    }
    const clonetree = gui.clone_tree(gui.get_node('choice'))
    let clonedNode: keyof typeof clonetree
    for (clonedNode in clonetree) {
      if (clonedNode == hash('choice')) {
        choiceLookup.choice = clonetree[clonedNode]
      } else if (clonedNode == hash('choice_box')) {
        choiceLookup.box = clonetree[clonedNode]
      } else if (clonedNode == hash('choice_text')) {
        choiceLookup.text = clonetree[clonedNode]
      }
    }
    nodes[parseInt(nKey)] = choiceLookup
    const [text_width, text_height]: number[] = get_text_size(
      choiceLookup.text,
      choices[parseInt(nKey)]
    )

    y = y - text_height / 2 - border_y
    gui.set_enabled(choiceLookup.choice, true)
    gui.set_text(choiceLookup.text, choices[parseInt(nKey)])
    gui.set_size(
      choiceLookup.box,
      vmath.vector3(text_width + 2 * border_x, text_height + 2 * border_y, 0)
    )
    gui.set_position(choiceLookup.choice, vmath.vector3(0, y, 0))
    gui.set_color(choiceLookup.box, color_unhovered)
    y = y - text_height / 2 - border_y - distance
  }
  y = y + border_y + distance
  gui.set_position(gui.get_node('choices'), vmath.vector3(0, -y / 2, 0))
}

function pick_choices(choice: number) {
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
  if (typeof hovered_choice !== 'number') return
  const node: node = nodes[hovered_choice].box

  gui.animate(
    node,
    'color',
    color_unhovered,
    gui.EASING_INOUTSINE,
    hover_duration
  )
  hovered_choice = false
}

function hover_choice(choice: number) {
  if (hovered_choice != false) unhover_choice()

  hovered_choice = choice
  const node = nodes[choice].box
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
    const choices: { [key: number]: string } = {}

    let tKey: keyof typeof message.text
    for (tKey in message.text) {
      choices[parseInt(tKey)] = message.text[tKey]
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
  actionId: hash,
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

  if (actionId == null) {
    if (typeof hovered_choice == 'number') {
      const node = nodes[hovered_choice]['box']
      if (!gui.pick_node(node, action.x, action.y)) {
        unhover_choice()
      }
    } else {
      for (const [nKey] of Object.entries(nodes)) {
        const node = nodes[parseInt(nKey)]['box']
        if (gui.pick_node(node, action.x, action.y)) {
          hover_choice(parseInt(nKey))
        }
      }
    }
  } else if (actionId == hash('touch')) {
    if (action.pressed) {
      for (const [nKey] of Object.entries(nodes)) {
        if (gui.pick_node(nodes[parseInt(nKey)]['box'], action.x, action.y)) {
          pressed_choice = parseInt(nKey)
        }
      }
    } else if (action.released) {
      if (
        typeof pressed_choice == 'number' &&
        gui.pick_node(nodes[pressed_choice]['box'], action.x, action.y)
      ) {
        pick_choices(pressed_choice)
      }
      pressed_choice = false
    }
  }
}
