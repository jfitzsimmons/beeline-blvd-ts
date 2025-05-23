const { rooms } = globalThis.game.world
function load_npcs() {
  const roomName = 'grounds' // testjpf remove hardcode string!

  const stations: { [key: string]: string } = rooms.all[roomName].stations
  let station: keyof typeof stations
  for (station in stations) {
    const npc = stations[station]
    const params = {
      npc,
    }
    msg.post(`/${station}#npc_loader`, 'load_npc', params)
  }

  const swaps = rooms.all[roomName].swaps
  let swap: keyof typeof swaps
  for (swap in swaps) {
    const npc = swaps[swap][1]
    const params = {
      npc,
    }
    print('groundsSWAPS::', swap, swaps[swap][0], swaps[swap][1])

    msg.post(`/${swaps[swap][0]}#npc_loader`, 'load_npc', params)
  }

  //TESTJPF do you need any of these sopecific level files?
  //see how much you can move to main level.ts

  let npc = rooms.fallbacks.stations.grounds_unplaced
  msg.post('/grounds_unplaced#npc_loader', 'load_npc', { npc })

  //load "AI" npc to screen prop
  npc = 'fredai'

  msg.post('/screen#screen_loader', 'show_npc', { npc })
}

function load_storage() {
  const params = {
    roomName: 'grounds',
    storagename: 'player_luggage',
    // ani: 'luggage01',
  }
  msg.post('/luggageplayer#storage', 'load_storage_inventory', params)

  params.storagename = 'other_luggage'
  //params.ani = 'luggage02'
  msg.post('/luggageother#storage', 'load_storage_inventory', params)

  msg.post('/phone#station', 'loadActor', { roomName: 'grounds' })

  params.storagename = 'cargo'
  // params.ani = 'luggage02'
  msg.post('/cargo#storage', 'load_storage_inventory', params)
}

function load_adjacent() {
  const roomNames = ['customs', 'reception', 'baggage'] // testjpf remove hardcode string!
  for (const adjacent of roomNames) {
    const stations: { [key: string]: string } = rooms.all[adjacent].stations
    let station: keyof typeof stations
    for (station in stations) {
      const npc = stations[station]
      msg.post(
        `/${adjacent}lite/${adjacent}${station}#npc_loader`,
        'load_shell',
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
        'load_shell',
        { npc }
      )
    }
  }

  //TESTJPF do you need any of these sopecific level files?
  //see how much you can move to main level.ts
  let npc = rooms.fallbacks.stations.reception_unplaced
  msg.post('/receptionlite/reception_unplaced#npc_loader', 'load_shell', {
    npc,
  })

  npc = rooms.fallbacks.stations.customs_unplaced
  msg.post('/customslite/customs_unplaced#npc_loader', 'load_shell', { npc })

  npc = rooms.fallbacks.stations.baggage_passer
  msg.post('/baggagelite/baggage_passer#npc_loader', 'load_shell', { npc })
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
    load_adjacent()
  }
}
