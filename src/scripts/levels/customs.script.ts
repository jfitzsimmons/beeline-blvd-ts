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

  const npc = rooms.fallbacks.stations.customs_unplaced
  msg.post('/customs_unplaced#npc_loader', 'load_npc', { npc })
}
function load_adjacent() {
  const roomNames = ['reception', 'grounds', 'baggage', 'admin1'] // testjpf remove hardcode string!
  for (const adjacent of roomNames) {
    const stations: { [key: string]: string } = rooms.all[adjacent].stations
    let station: keyof typeof stations
    for (station in stations) {
      const npc = stations[station]
      msg.post(
        `/${adjacent}lite/${adjacent}${station}#npc_loader`,
        'load_npc',
        { npc }
      )
    }

    const swaps = rooms.all[adjacent].swaps
    let swap: keyof typeof swaps
    for (swap in swaps) {
      const npc = swaps[swap][1]
      print('RECEPTIONSWAPS::', swap, swaps[swap][0], swaps[swap][1])
      msg.post(
        `/${adjacent}lite/${adjacent}${swaps[swap][0]}#npc_loader`,
        'load_npc',
        { npc }
      )
    }
  }

  //TESTJPF do you need any of these sopecific level files?
  //see how much you can move to main level.ts
  let npc = rooms.fallbacks.stations.grounds_unplaced
  msg.post('/groundslite/grounds_unplaced#npc_loader', 'load_npc', { npc })

  npc = rooms.fallbacks.stations.baggage_passer
  msg.post('/baggagelite/baggage_passer#npc_loader', 'load_npc', { npc })

  npc = rooms.fallbacks.stations.admin1_passer
  msg.post('/admin1lite/admin1_passer#npc_loader', 'load_npc', { npc })

  npc = rooms.fallbacks.stations.reception_unplaced
  msg.post('/receptionlite/reception_unplaced#npc_loader', 'load_npc', { npc })
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
    load_adjacent()
  }
}
