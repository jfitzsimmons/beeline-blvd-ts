const { player } = globalThis.game.world
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
  const params = {
    load_type: 'room transition',
    enter_room: room_lookup[hash_to_hex(go.get_id())],
  }

  player.pos = go.get_position()
  msg.post('proxies:/controller#worldcontroller', 'pick_room', params)
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
