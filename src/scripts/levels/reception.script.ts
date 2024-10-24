//const world = require "main.states.worldstate"
// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-var-requires
//const utils = require('../utils.utils')
const { rooms } = globalThis.game.world
function load_npcs() {
  const roomname = 'reception' // testjpf remove hardcode string!

  const stations: { [key: string]: string } = rooms.all[roomname].stations
  let station: keyof typeof stations
  for (station in stations) {
    const npc = stations[station]
    print('reception load level:::: ', npc, station)
    //  if (npc != '') {
    station == 'desk'
      ? msg.post('desk#station', 'load_station', { npc, roomname })
      : msg.post(`/${station}#npc_loader`, 'load_npc', { npc })
    //   }
    //params.script = params.roomname + "/" + world.player.checkpoint:sub(1, -2) + "aid"
  }

  //TESTJPF do you need any of these sopecific level files?
  //see how much you can move to main level.ts

  const npc = rooms.fallbacks.stations.reception_unplaced
  msg.post('/unplaced#npc_loader', 'load_npc', { npc })
}

function load_storage() {
  const params = {
    roomname: 'reception',
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
  }
}
