const { rooms } = globalThis.game.world
function load_npcs() {
  const roomName = 'admin1' // testjpf remove hardcode string!

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

  //TESTJPF do you need any of these sopecific level files?
  //see how much you can move to main level.ts

  const npc = rooms.fallbacks.stations.admin1_passer
  msg.post('/admin1_passer#npc_loader', 'load_npc', { npc })
}

export function on_message(messageId: hash, _sender: url): void {
  if (messageId == hash('room_load')) {
    load_npcs()
  }
}
