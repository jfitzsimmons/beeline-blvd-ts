const { rooms } = globalThis.game.world
function load_npcs() {
  const roomName = 'reception' // testjpf remove hardcode string!
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
    print('RECEPTIONSWAPS::', swap, swaps[swap][0], swaps[swap][1])
    msg.post(`/${swaps[swap][0]}#npc_loader`, 'load_npc', { npc })
  }

  //TESTJPF do you need any of these sopecific level files?
  //see how much you can move to main level.ts
  const npc = rooms.fallbacks.stations.reception_unplaced
  msg.post('/reception_unplaced#npc_loader', 'load_npc', { npc })
}

function load_adjacent() {
  const roomNames = ['customs', 'grounds', 'baggage', 'admin1', 'security'] // testjpf remove hardcode string!
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
  let npc = rooms.fallbacks.stations.grounds_unplaced
  msg.post('/groundslite/grounds_unplaced#npc_loader', 'load_shell', { npc })

  npc = rooms.fallbacks.stations.customs_unplaced
  msg.post('/customslite/customs_unplaced#npc_loader', 'load_shell', { npc })

  npc = rooms.fallbacks.stations.baggage_passer
  msg.post('/baggagelite/baggage_passer#npc_loader', 'load_shell', { npc })

  npc = rooms.fallbacks.stations.admin1_passer
  msg.post('/admin1lite/admin1_passer#npc_loader', 'load_shell', { npc })

  npc = rooms.fallbacks.stations.security_passer
  msg.post('/securitylite/security_passer#npc_loader', 'load_shell', { npc })

  msg.post('/securitylite/prisoner1#npc_loader', 'load_shell', {
    npc: rooms.all['security'].wards!.prisoner1,
  })
  msg.post('/securitylite/prisoner2#npc_loader', 'load_shell', {
    npc: rooms.all['security'].wards!.prisoner2,
  })
  msg.post('/securitylite/prisoner3#npc_loader', 'load_shell', {
    npc: rooms.all['security'].wards!.prisoner3,
  })
  msg.post('/securitylite/prisoner4#npc_loader', 'load_shell', {
    npc: rooms.all['security'].wards!.prisoner4,
  })
}

function load_storage() {
  const params = {
    roomName: 'reception',
    storagename: 'vase',
    ani: 'vase_art1',
  }
  msg.post('/vase1#storage', 'load_storage_inventory', params)
  sprite.play_flipbook('/vase1#sprite', params.ani)

  params.storagename = 'vase2'
  params.ani = 'vase_art6'
  msg.post('/vase2#storage', 'load_storage_inventory', params)
  sprite.play_flipbook('/vase2#sprite', params.ani)
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
