const { rooms } = globalThis.game.world

function load_npcs() {
  const roomName = 'baggage' // testjpf remove hardcode string!
  const stations: { [key: string]: string } = rooms.all[roomName].stations
  let station: keyof typeof stations
  for (station in stations) {
    const npc = stations[station]
    station == 'desk'
      ? msg.post('deskarea#station', 'loadStation', { npc, roomName })
      : msg.post(`/${station}#npc_loader`, 'load_npc', { npc })
  }

  const swaps = rooms.all[roomName].swaps
  let swap: keyof typeof swaps
  for (swap in swaps) {
    const npc = swaps[swap][1]
    const params = {
      npc,
    }
    msg.post(`/${swaps[swap][0]}#npc_loader`, 'load_npc', params)
  }
  const npc = rooms.fallbacks.stations.baggage_passer
  msg.post('/baggage_passer#npc_loader', 'load_npc', { npc })
}

function load_storage() {
  const params = {
    roomName: 'baggage',
    storagename: 'luggage_1',
    ani: 'luggage01',
  }
  msg.post('/luggage1#storage', 'load_storage_inventory', params)
  sprite.play_flipbook('/luggage1#sprite', params.ani)

  params.storagename = 'luggage_2'
  params.ani = 'luggage02'
  msg.post('/luggage2#storage', 'load_storage_inventory', params)
  sprite.play_flipbook('/luggage2#sprite', params.ani)
}

export function on_message(
  // this: any,
  messageId: hash,
  // message: any,
  _sender: url
): void {
  if (messageId == hash('room_load')) {
    load_npcs()
    load_storage()
  }
}
