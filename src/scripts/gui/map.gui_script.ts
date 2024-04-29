const { player, rooms } = globalThis.game.world
function check_room_nodes(action: { x: number; y: number }) {
  let kr: keyof typeof rooms.all
  for (kr in rooms.all) {
    const nodename = kr
    const node = gui.get_node(nodename)

    if (gui.pick_node(node, action.x, action.y)) {
      const params = {
        enter_room: kr,
      }
      msg.post('proxies:/controller#worldcontroller', 'pick_room', params)
    }
  }
}
export function on_input(
  this: any,
  action_id: hash,
  action: {
    released: boolean
    x: number
    y: number
  }
) {
  if (action_id == hash('touch') && action.released) {
    check_room_nodes(action)
  }
}

export function on_message(this: any, messageId: hash, _sender: url): void {
  if (messageId == hash('update_heat')) {
    const pienode = gui.get_node('heat')
    let angle = Math.round(player.heat * 180)
    if (angle > 180) angle = 180
    // get the outer bounds
    gui.set_fill_angle(pienode, angle)
  }
}
