const { rooms } = globalThis.game.world

function load_npcs() {
  const roomName = 'baggage' // testjpf remove hardcode string!
  const stations: { [key: string]: string } = rooms.all[roomName].stations
  let station: keyof typeof stations
  for (station in stations) {
    const npc = stations[station]
    station == 'desk'
      ? msg.post('desk#station', 'loadStation', { npc, roomName })
      : msg.post(`/${station}#npc_loader`, 'load_npc', { npc })
  }
}

function load_storage() {
  const params = {
    roomName: 'baggage',
    storagename: 'luggage_1',
    ani: 'luggage01',
  }
  msg.post('/luggage1#storage', 'load_storage_inventory', params)
  sprite.play_flipbook('/luggage1#sprite', params.ani)

  params.storagename = 'luggage_2'
  params.ani = 'luggage02'
  msg.post('/luggage2#storage', 'load_storage_inventory', params)
  sprite.play_flipbook('/luggage2#sprite', params.ani)
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
			roomName = "baggage", 
			npc = ""
		}

		params.npc = world.rooms.all["baggage"].stations.worker1
		if params.npc ~= "" then params.script = params.roomName .. "/" .. world.player.checkpoint:sub(1, -2) .. "worker1" end 
		msg.post("/worker1#npc_loader", "load_npc", params)

		params.npc = world.rooms.all["baggage"].stations.assistant
		if params.npc ~= "" then params.script = params.roomName .. "/" .. world.player.checkpoint:sub(1, -2) .. "assistant" end 
		msg.post("/assistant#npc_loader", "load_npc", params)

		params.npc = world.rooms.all["baggage"].stations.guard
		if params.npc ~= "" then params.script = params.roomName .. "/" .. world.player.checkpoint:sub(1, -2) .. "guard" end 
		msg.post("/guard#npc_loader", "load_npc", params)

		params.npc = world.rooms.all["baggage"].stations.browse
		if params.npc ~= "" then params.script = params.roomName .. "/" .. world.player.checkpoint:sub(1, -2) .. "browse" end 
		msg.post("/browse#npc_loader", "load_npc", params)


		params = {
			roomName = "baggage", 
			storagename = "luggage_1", 
			ani = "luggage01"
		}
		msg.post("/luggage1#storage", "load_storage_inventory", params)

		params.storagename = "luggage_2"
		params.ani = "luggage02"
		msg.post("/luggage2#storage", "load_storage_inventory", params)
	end
end*/
