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

  //TESTJPF do you need any of these sopecific level files?
  //see how much you can move to main level.ts

  const npc = rooms.fallbacks.stations.security_passer
  msg.post('/passer#npc_loader', 'load_npc', { npc })

  msg.post('prisoner1#npc_loader', 'load_npc', {
    npc: rooms.all['security'].occupants!.prisoner1,
  })
  msg.post('prisoner2#npc_loader', 'load_npc', {
    npc: rooms.all['security'].occupants!.prisoner2,
  })
  msg.post('prisoner3#npc_loader', 'load_npc', {
    npc: rooms.all['security'].occupants!.prisoner3,
  })
  msg.post('prisoner4#npc_loader', 'load_npc', {
    npc: rooms.all['security'].occupants!.prisoner4,
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
