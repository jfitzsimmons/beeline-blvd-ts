const { rooms, stations } = globalThis.game.world

export function loadNpcs() {
  const roomName = rooms.focused // testjpf remove hardcode string!
  //const stations: { [key: string]: string } = rooms.all[roomName].stations

  for (const station of rooms.all[roomName].stationKeys) {
    const npc = stations.all[station]
    station == 'desk'
      ? msg.post('deskarea#station', 'loadStation', { npc, roomName })
      : msg.post(`/${station}#npc_loader`, 'load_npc', { npc })
  }
}
export function load_adjacent() {
  const roomNames = rooms.getAdjacentRoomNames()
  for (const adjacent of roomNames) {
    const sKeys: string[] = rooms.all[adjacent].stationKeys
    //let station: keyof typeof stations
    for (const s of sKeys) {
      const npc = stations.all[s].occupant
      msg.post(
        `/${adjacent}lite/${adjacent}${stations.all[s].name}#npc_loader`,
        'load_shell',
        {
          npc,
        }
      )
    }
  }
}
export function load_storage() {
  const actors = rooms.all[rooms.focused].actors
  let sKey: keyof typeof actors
  for (sKey in actors) {
    const actor = actors[sKey]
    const params = {
      roomName: rooms.focused,
      storagename: actor.name,
      animation: actor.animation,
    }
    msg.post(`/${actor.id}#storage`, 'load_storage_inventory', params)
    sprite.play_flipbook(`/${actor.id}#sprite`, params.animation)
  }
}
