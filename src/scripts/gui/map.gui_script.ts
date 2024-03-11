//const world = require('main.states.worldstate')
const { player, rooms } = globalThis.game.world
//testjpf i don't think this should run after exiting novel scene
function check_room_nodes(action: { x: number; y: number }) {
  //for k,v in pairs(world.rooms) do

  let kr: keyof typeof rooms.all // Type is "one" | "two" | "three"
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

export function on_message(
  this: any,
  messageId: hash,
  // message: any,
  _sender: url
): void {
  if (messageId == hash('update_heat')) {
    const pienode = gui.get_node('heat')
    let angle = player.alert_level * 30
    if (angle > 180) angle = 180
    // get the outer bounds
    gui.set_fill_angle(pienode, angle)
  }
}
