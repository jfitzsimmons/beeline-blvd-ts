const { rooms } = globalThis.game.world
function load_npcs() {
  const roomName = 'customs' // testjpf remove hardcode string!

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
}

function load_storage() {
  const params = {
    roomName: 'customs',
    storagename: 'vase3',
    ani: 'vase_art1',
  }
  msg.post('/vase3#storage', 'load_storage_inventory', params)
  sprite.play_flipbook('/vase3#sprite', params.ani)

  //msg.post('/locker#storage', 'load_storage_inventory', {
  //roomname: 'customs',
  //storagename: 'locker',
  //})
}

export function on_message(messageId: hash, _sender: url): void {
  if (messageId == hash('room_load')) {
    load_npcs()
    load_storage()
  }
}
