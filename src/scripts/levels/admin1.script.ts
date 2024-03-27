//local world = require "main.states.worldstate"
//local novel = require "main.utils.novel"

const { rooms } = globalThis.game.world
function load_npcs() {
  const roomname = 'admin1' // testjpf remove hardcode string!

  const stations: { [key: string]: string } = rooms.all[roomname].stations
  let station: keyof typeof stations
  for (station in stations) {
    const npc = stations[station]
    //  if (npc != '') {
    station == 'desk'
      ? msg.post('desk#station', 'load_station', { npc, roomname })
      : msg.post(`/${station}#npc_loader`, 'load_npc', { npc })
    //   }
    //params.script = params.roomname + "/" + world.player.checkpoint:sub(1, -2) + "aid"
  }

  //TESTJPF do you need any of these sopecific level files?
  //see how much you can move to main level.ts

  const npc = rooms.fallbacks.stations.admin1_passer
  msg.post('/passer#npc_loader', 'load_npc', { npc })
}

export function on_message(messageId: hash, _sender: url): void {
  if (messageId == hash('room_load')) {
    load_npcs()
  }
}
