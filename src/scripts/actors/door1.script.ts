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
  /**
   * loop thru npcs.onscreen
   * run their behavior??
   * *future plans needed
   * testjpf
   *
   * -------
   * if player has any activebehaviors
   * send message to level to run behaviors
   * could be cool to give player menu
   * where they can choose to run the behaviors now,
   * or go back into the room and poke around
   *
   * would additionally be cool that before entering door
   * it gave you a menu telling you that you have a chance of
   * being noticed for trespassing
   * these compound and make things more difficult for player
   *
   * need UI
   * */
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
  print('DOORpick room')
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
