const { rooms } = globalThis.game.world
function load_npcs() {
  const roomname = 'infirmary' // testjpf remove hardcode string!

  const stations: { [key: string]: string } = rooms.all[roomname].stations
  let station: keyof typeof stations
  for (station in stations) {
    const npc = stations[station]
    //  if (npc != '') {
    station == 'assistant'
      ? msg.post('desk#station', 'load_station', { npc, roomname })
      : msg.post(`/${station}#npc_loader`, 'load_npc', { npc })
    //   }
    //params.script = params.roomname + "/" + world.player.checkpoint:sub(1, -2) + "aid"
  }
  msg.post('patient1#npc_loader', 'load_npc', {
    npc: rooms.all['infirmary'].occupants!.patient1,
  })
  msg.post('patient2#npc_loader', 'load_npc', {
    npc: rooms.all['infirmary'].occupants!.patient2,
  })
  msg.post('patient3#npc_loader', 'load_npc', {
    npc: rooms.all['infirmary'].occupants!.patient3,
  })
  msg.post('patient4#npc_loader', 'load_npc', {
    npc: rooms.all['infirmary'].occupants!.patient4,
  })

  //let npc = rooms.fallbacks.stations.infirmary_outside1
  msg.post('/outside1#npc_loader', 'load_npc', {
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
