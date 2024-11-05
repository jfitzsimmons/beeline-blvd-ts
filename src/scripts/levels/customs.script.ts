const { rooms } = globalThis.game.world
function load_npcs() {
  const roomName = 'customs' // testjpf remove hardcode string!

  const stations: { [key: string]: string } = rooms.all[roomName].stations
  let station: keyof typeof stations
  for (station in stations) {
    const npc = stations[station]
    //  if (npc != '') {
    station == 'desk'
      ? msg.post('desk#station', 'loadStation', { npc, roomName })
      : msg.post(`/${station}#npc_loader`, 'load_npc', { npc })
    //   }
    //params.script = params.roomName + "/" + world.player.checkpoint:sub(1, -2) + "aid"
  }
}

function load_storage() {
  const params = {
    roomName: 'customs',
    storagename: 'vase3',
    ani: 'vase_art1',
  }
  msg.post('/vase3#storage', 'load_storage_inventory', params)
  sprite.play_flipbook('/vase3#sprite', params.ani)
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
			roomName = "customs", 
			npc = world.rooms.all["customs"].stations.desk,
		}
		if params.npc ~= "" then params.script = params.roomName .. "/" .. world.player.checkpoint:sub(1, -2) .. "desk" .. world.npcs.all[params.npc].clan end		
		msg.post("desk#station", "loadStation", params)

		params.npc = world.rooms.all["customs"].stations.loiter1
		if params.npc ~= "" then params.script = params.roomName .. "/" .. world.player.checkpoint:sub(1, -2) .. "loiter1" end -- .. world.npcs.all[params.npc].clan end -- .. world.npcs.all[message.npc].love--love_score or 5
		msg.post("loiter1#npc_loader", "load_npc", params)

		params.npc = world.rooms.all["customs"].stations.guard
		if params.npc ~= "" then params.script = params.roomName .. "/" .. world.player.checkpoint:sub(1, -2) .. "guard" end -- .. world.npcs.all[params.npc].clan end -- .. world.npcs.all[message.npc].love--love_score or 5
		msg.post("guard#npc_loader", "load_npc", params)

		params.npc = world.rooms.all["customs"].stations.loiter3
		if params.npc ~= "" then params.script = params.roomName .. "/" .. world.player.checkpoint:sub(1, -2) .. "loiter3" end -- .. world.npcs.all[params.npc].clan end -- .. world.npcs.all[message.npc].love--love_score or 5
		msg.post("loiter3#npc_loader", "load_npc", params)

		params.npc = world.rooms.all["customs"].stations.loiter4
		if params.npc ~= "" then params.script = params.roomName .. "/" .. world.player.checkpoint:sub(1, -2) .. "loiter4" end -- .. world.npcs.all[params.npc].clan end -- .. world.npcs.all[message.npc].love--love_score or 5
		msg.post("loiter4#npc_loader", "load_npc", params)

		params.npc = world.rooms.all["customs"].stations.guest
		if params.npc ~= "" then params.script = params.roomName .. "/" .. world.player.checkpoint:sub(1, -2) .. "guest" end -- .. world.npcs.all[params.npc].clan end -- .. world.npcs.all[message.npc].love--love_score or 5
		msg.post("guest#npc_loader", "load_npc", params)

		params.npc = world.rooms.all["customs"].stations.patrol
		if params.npc ~= "" then params.script = params.roomName .. "/" .. world.player.checkpoint:sub(1, -2) .. "patrol" end -- .. world.npcs.all[params.npc].clan end -- .. world.npcs.all[message.npc].love--love_score or 5
		msg.post("patrol#npc_loader", "load_npc", params)
		
	end
end*/
