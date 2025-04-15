interface props {
  initial_position: vmath.vector3
  right: boolean
}
export function init(this: props) {
  this.initial_position = go.get_position()
}

function apply_init_force(ball: string, offset: vmath.vector3) {
  const position = go.get_position(ball)
  const message = {
    position: position + offset,
    force: vmath.vector3(0, 10000 * 3, 0), // times mass
  }
  msg.post(ball, 'apply_force', message)
}

export function on_message(
  this: props,
  messageId: hash,
  message: {
    other_group: hash
  },
  _sender: url
) {
  if (messageId == hash('collision_response')) {
    if (message.other_group == hash('respawn')) {
      go.set_position(this.initial_position)
      apply_init_force('#collisionobject', vmath.vector3(0, 0, 0))
    }
  }
}
