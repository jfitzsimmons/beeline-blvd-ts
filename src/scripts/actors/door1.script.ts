// eslint-disable-next-line @typescript-eslint/no-var-requires, @typescript-eslint/no-unsafe-assignment
const world: world = require('../../main.states.worldstate')

interface world {
  player: any
  npcs: any
  tasks: any
  clock: number
}

//testjpf need to send hastohex to here too!!!
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
  // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
  const params = {
    load_type: 'room transition',
    enter_room: room_lookup[hash_to_hex(go.get_id())],
  }

  // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
  world.player.pos = go.get_position()
  msg.post('proxies:/controller#worldcontroller', 'pick_room', params)
}

// testjpf trigger ts build fart?
export function on_message(
  //  this: props,
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
