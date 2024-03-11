//const world = require "main.states.worldstate"
// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-var-requires
const novel = require('../../../main.utils.novel')
const { rooms } = globalThis.game.world
function load_npcs() {
  const roomname = 'grounds' // testjpf remove hardcode string!

  const stations: { [key: string]: string } = rooms.all[roomname].stations
  let station: keyof typeof stations
  for (station in stations) {
    const npc = stations[station]
    if (npc != '') {
      const params = {
        npc,
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
        script: novel.script_builder(npc, roomname, station, null, false),
      }
      msg.post('/aid#npc_loader', 'load_npc', params)
    }
    //params.script = params.roomname + "/" + world.player.checkpoint:sub(1, -2) + "aid"
  }

  //TESTJPF do you need any of these sopecific level files?
  //see how much you can move to main level.ts

  //testjpf for loop
  // for each rooms.all[roomname].stations {build params}
  /** 

	params.npc = world.rooms.all["grounds"].stations.worker1
	if (params.npc != "") { params.script = params.roomname + "/" + world.player.checkpoint:sub(1, -2) + "worker1" } 
	msg.post("/worker1#npc_loader", "load_npc", params)

	params.npc = world.rooms.all["grounds"].stations.assistant
	if (params.npc != "") { params.script = novel.script_builder(params.npc,params.roomname, "assistant", nil, false)  } 
	msg.post("/assistant#npc_loader", "load_npc", params)

	params.npc = world.rooms.all["grounds"].stations.loiter1
	if (params.npc != "") { params.script = params.roomname + "/" + world.player.checkpoint:sub(1, -2) + "loiter1" } 
	msg.post("/loiter1#npc_loader", "load_npc", params)

	params.npc = world.rooms.all["grounds"].stations.guest
	if (params.npc != "") { params.script = params.roomname + "/" + world.player.checkpoint:sub(1, -2) + "guest" } 
	msg.post("/guest#npc_loader", "load_npc", params)

	params.npc = world.rooms.all["grounds"].stations.guest2
	if (params.npc != "") { params.script = novel.script_builder(params.npc,params.roomname, "guest2", nil, false) } 
	msg.post("/guest2#npc_loader", "load_npc", params)

	params.npc = world.rooms.all["grounds"].stations.worker2
	if (params.npc != "") { params.script = params.roomname + "/" + world.player.checkpoint:sub(1, -2) + "worker2" } 
	msg.post("/worker2#npc_loader", "load_npc", params)

	params.npc = world.rooms.fallbacks.stations.grounds_unplaced
	if (params.npc != "") { params.script = novel.script_builder(params.npc,params.roomname, "unplaced", nil, false)  } 
	msg.post("/unplaced#npc_loader", "load_npc", params)

	//load "AI" npc to screen prop
	params.npc = "fredai"
	params.script = params.roomname + "/" + world.player.checkpoint:sub(1, -2) + "screen" + "ais" 
	msg.post("/screen#screen_loader", "show_npc", params)
	**/
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
  this: any,
  messageId: hash,
  // message: any,
  _sender: url
): void {
  if (messageId == hash('room_load')) {
    load_npcs()
    load_storage()
  }
}
