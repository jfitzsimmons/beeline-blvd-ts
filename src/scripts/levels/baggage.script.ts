//const world = require "main.states.worldstate"
// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-var-requires
//const utils = require('../utils.utils')
const { rooms } = globalThis.game.world
function load_npcs() {
  const roomname = 'baggage' // testjpf remove hardcode string!

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

  const npc = rooms.fallbacks.stations.reception_unplaced
  msg.post('/unplaced#npc_loader', 'load_npc', { npc })
}

function load_storage() {
  const params = {
    roomname: 'baggage',
    storagename: 'luggage_1',
    ani: 'luggage01',
  }
  msg.post('/luggage1#storage', 'load_storage_inventory', params)
  sprite.play_flipbook('/luggage01#sprite', params.ani)

  params.storagename = 'luggage_2'
  params.ani = 'luggage02'
  msg.post('/luggage2#storage', 'load_storage_inventory', params)
  sprite.play_flipbook('/luggage02#sprite', params.ani)
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

/** 
local world = require "main.states.worldstate"

function on_message(self, message_id, message, sender)
	if message_id == hash("room_load") then
		local params = {
			roomname = "baggage", 
			npc = ""
		}

		params.npc = world.rooms.all["baggage"].stations.worker1
		if params.npc ~= "" then params.script = params.roomname .. "/" .. world.player.checkpoint:sub(1, -2) .. "worker1" end 
		msg.post("/worker1#npc_loader", "load_npc", params)

		params.npc = world.rooms.all["baggage"].stations.assistant
		if params.npc ~= "" then params.script = params.roomname .. "/" .. world.player.checkpoint:sub(1, -2) .. "assistant" end 
		msg.post("/assistant#npc_loader", "load_npc", params)

		params.npc = world.rooms.all["baggage"].stations.guard
		if params.npc ~= "" then params.script = params.roomname .. "/" .. world.player.checkpoint:sub(1, -2) .. "guard" end 
		msg.post("/guard#npc_loader", "load_npc", params)

		params.npc = world.rooms.all["baggage"].stations.browse
		if params.npc ~= "" then params.script = params.roomname .. "/" .. world.player.checkpoint:sub(1, -2) .. "browse" end 
		msg.post("/browse#npc_loader", "load_npc", params)


		params = {
			roomname = "baggage", 
			storagename = "luggage_1", 
			ani = "luggage01"
		}
		msg.post("/luggage1#storage", "load_storage_inventory", params)

		params.storagename = "luggage_2"
		params.ani = "luggage02"
		msg.post("/luggage2#storage", "load_storage_inventory", params)
	end
end*/
