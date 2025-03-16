const { rooms } = globalThis.game.world
function load_npcs() {
  const roomName = 'infirmary' // testjpf remove hardcode string!

  const stations: { [key: string]: string } = rooms.all[roomName].stations
  let station: keyof typeof stations
  for (station in stations) {
    const npc = stations[station]
    station == 'assistant'
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

  msg.post('patient1#npc_loader', 'load_npc', {
    npc: rooms.all['infirmary'].wards!.patient1,
  })
  msg.post('patient2#npc_loader', 'load_npc', {
    npc: rooms.all['infirmary'].wards!.patient2,
  })
  msg.post('patient3#npc_loader', 'load_npc', {
    npc: rooms.all['infirmary'].wards!.patient3,
  })
  msg.post('patient4#npc_loader', 'load_npc', {
    npc: rooms.all['infirmary'].wards!.patient4,
  })

  msg.post('/infirmary_outside1#npc_loader', 'load_npc', {
    npc: rooms.fallbacks.stations.infirmary_outside1,
  })
}

export function on_message(
  // this: any,
  messageId: hash,
  // message: any,
  _sender: url
): void {
  if (messageId == hash('room_load')) {
    load_npcs()
  }
}
