const { player, tasks } = globalThis.game.world
const room_lookup = {
  [hash_to_hex(hash('/to_baggage'))]: 'baggage',
  [hash_to_hex(hash('/to_grounds'))]: 'grounds',
  [hash_to_hex(hash('/to_reception'))]: 'reception',
  [hash_to_hex(hash('/to_customs'))]: 'customs',
  [hash_to_hex(hash('/to_admin1'))]: 'admin1',
  [hash_to_hex(hash('/to_security'))]: 'security',
  [hash_to_hex(hash('/to_infirmary'))]: 'infirmary',
}
function transition() {
  let params = {
    loadType: 'room transition',
    roomName: room_lookup[hash_to_hex(go.get_id())],
  }
  if (player.ap <= 0) {
    params = {
      roomName: tasks.spawn,
      loadType: 'faint',
    }
  }
  player.pos = go.get_position()
  msg.post('worldproxies:/controller#worldcontroller', 'pick_room', params)
}

export function on_message(
  messageId: hash,
  message: {
    distance: number
  },
  _sender: url
): void {
  if (messageId == hash('contact_point_response')) {
    if (message.distance < 10) {
      transition()
    }
  }
}
