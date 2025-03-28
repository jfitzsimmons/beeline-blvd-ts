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

function load_adjacent() {
  const roomNames = ['customs', 'reception', 'infirmary', 'security'] // testjpf remove hardcode string!
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

  let npc = rooms.fallbacks.stations.customs_unplaced
  msg.post('/customslite/customs_unplaced#npc_loader', 'load_npc', { npc })

  npc = rooms.fallbacks.stations.security_passer
  msg.post('/securitylite/security_passer#npc_loader', 'load_npc', { npc })

  msg.post('/infirmarylite/infirmary_outside1#npc_loader', 'load_npc', {
    npc: rooms.fallbacks.stations.infirmary_outside1,
  })

  npc = rooms.fallbacks.stations.reception_unplaced
  msg.post('/receptionlite/reception_unplaced#npc_loader', 'load_npc', { npc })

  msg.post('/securitylite/prisoner1#npc_loader', 'load_npc', {
    npc: rooms.all['security'].wards!.prisoner1,
  })
  msg.post('/securitylite/prisoner2#npc_loader', 'load_npc', {
    npc: rooms.all['security'].wards!.prisoner2,
  })
  msg.post('/securitylite/prisoner3#npc_loader', 'load_npc', {
    npc: rooms.all['security'].wards!.prisoner3,
  })
  msg.post('/securitylite/prisoner4#npc_loader', 'load_npc', {
    npc: rooms.all['security'].wards!.prisoner4,
  })
  msg.post('/infirmarylite/patient1#npc_loader', 'load_npc', {
    npc: rooms.all['infirmary'].wards!.patient1,
  })
  msg.post('/infirmarylite/patient2#npc_loader', 'load_npc', {
    npc: rooms.all['infirmary'].wards!.patient2,
  })
  msg.post('/infirmarylite/patient3#npc_loader', 'load_npc', {
    npc: rooms.all['infirmary'].wards!.patient3,
  })
  msg.post('/infirmarylite/patient4#npc_loader', 'load_npc', {
    npc: rooms.all['infirmary'].wards!.patient4,
  })
}

export function on_message(messageId: hash, _sender: url): void {
  if (messageId == hash('room_load')) {
    load_npcs()
    load_adjacent()
  }
}
