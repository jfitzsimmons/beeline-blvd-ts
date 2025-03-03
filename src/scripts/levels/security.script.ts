const { rooms } = globalThis.game.world
function load_npcs() {
  const roomName = 'security' // testjpf remove hardcode string!

  const stations: { [key: string]: string } = rooms.all[roomName].stations
  let station: keyof typeof stations
  for (station in stations) {
    const npc = stations[station]
    station == 'desk'
      ? msg.post('desk#station', 'loadStation', { npc, roomName })
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

  const npc = rooms.fallbacks.stations.security_passer
  msg.post('/passer#npc_loader', 'load_npc', { npc })

  msg.post('prisoner1#npc_loader', 'load_npc', {
    npc: rooms.all['security'].wards!.prisoner1,
  })
  msg.post('prisoner2#npc_loader', 'load_npc', {
    npc: rooms.all['security'].wards!.prisoner2,
  })
  msg.post('prisoner3#npc_loader', 'load_npc', {
    npc: rooms.all['security'].wards!.prisoner3,
  })
  msg.post('prisoner4#npc_loader', 'load_npc', {
    npc: rooms.all['security'].wards!.prisoner4,
  })

  msg.post('/outside1#npc_loader', 'load_npc', {
    npc: rooms.fallbacks.stations.security_outside1,
  })
}

export function on_message(messageId: hash, _sender: url): void {
  if (messageId == hash('room_load')) {
    load_npcs()
  }
}
