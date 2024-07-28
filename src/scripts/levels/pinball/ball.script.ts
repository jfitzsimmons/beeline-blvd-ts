interface props {
  initial_position: vmath.vector3
  right: boolean
}
export function init(this: props) {
  this.initial_position = go.get_position()
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
    }
  }
}
