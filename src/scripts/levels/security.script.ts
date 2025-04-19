const { rooms } = globalThis.game.world
function load_npcs() {
  const roomName = 'security' // testjpf remove hardcode string!

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

  const npc = rooms.fallbacks.stations.security_passer
  msg.post('/security_passer#npc_loader', 'load_npc', { npc })

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

  msg.post('/security_outside1#npc_loader', 'load_npc', {
    npc: rooms.fallbacks.stations.security_outside1,
  })
}

function load_adjacent() {
  const roomNames = ['reception', 'admin1', 'infirmary'] // testjpf remove hardcode string!
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

  let npc = rooms.fallbacks.stations.admin1_passer
  msg.post('/admin1lite/admin1_passer#npc_loader', 'load_shell', { npc })

  npc = rooms.fallbacks.stations.reception_unplaced
  msg.post('/receptionlite/reception_unplaced#npc_loader', 'load_shell', {
    npc,
  })
  msg.post('/infirmarylite/infirmary_outside1#npc_loader', 'load_shell', {
    npc: rooms.fallbacks.stations.infirmary_outside1,
  })
  msg.post('/infirmarylite/patient1#npc_loader', 'load_shell', {
    npc: rooms.all['infirmary'].wards!.patient1,
  })
  msg.post('/infirmarylite/patient2#npc_loader', 'load_shell', {
    npc: rooms.all['infirmary'].wards!.patient2,
  })
  msg.post('/infirmarylite/patient3#npc_loader', 'load_shell', {
    npc: rooms.all['infirmary'].wards!.patient3,
  })
  msg.post('/infirmarylite/patient4#npc_loader', 'load_shell', {
    npc: rooms.all['infirmary'].wards!.patient4,
  })
}

export function on_message(messageId: hash, _sender: url): void {
  if (messageId == hash('room_load')) {
    load_npcs()
    load_adjacent()
  }
}
