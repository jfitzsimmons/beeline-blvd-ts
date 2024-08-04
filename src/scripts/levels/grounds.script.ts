const { rooms } = globalThis.game.world
function load_npcs() {
  const roomname = 'grounds' // testjpf remove hardcode string!

  const stations: { [key: string]: string } = rooms.all[roomname].stations
  let station: keyof typeof stations
  for (station in stations) {
    const npc = stations[station]
    const params = {
      npc,
    }
    msg.post(`/${station}#npc_loader`, 'load_npc', params)
    //params.script = params.roomname + "/" + world.player.checkpoint:sub(1, -2) + "aid"
  }

  //TESTJPF do you need any of these sopecific level files?
  //see how much you can move to main level.ts

  let npc = rooms.fallbacks.stations.grounds_unplaced
  msg.post('/unplaced#npc_loader', 'load_npc', { npc })

  //load "AI" npc to screen prop
  npc = 'fredai'

  msg.post('/screen#screen_loader', 'show_npc', { npc })
}

function load_storage() {
  const params = {
    roomname: 'grounds',
    storagename: 'player_luggage',
    ani: 'luggage01',
  }
  msg.post('/luggageplayer#storage', 'load_storage_inventory', params)

  params.storagename = 'other_luggage'
  params.ani = 'luggage02'
  msg.post('/luggageother#storage', 'load_storage_inventory', params)
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
  }
}
