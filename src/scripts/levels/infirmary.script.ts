const { rooms } = globalThis.game.world
function load_npcs() {
  const roomname = 'infirmary' // testjpf remove hardcode string!

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
}

export function on_message(
  // this: any,
  messageId: hash,
  // message: any,
  _sender: url
): void {
  if (messageId == hash('room_load')) {
    load_npcs()
  }
}

/**local world = require "main.states.worldstate"
local novel = require "main.utils.novel"

function on_message(self, message_id, message, sender)
	if message_id == hash("room_load") then
		--load npcs and inventory
		local params = {
			roomname = "infirmary", 
			npc = world.rooms.all["infirmary"].stations.assistant,
			script = ""
		}
		if params.npc ~= "" then params.script = params.roomname .. "/" .. world.player.checkpoint:sub(1, -2) .. "assistant" end -- 
		
		--load desk interactions and npc
		msg.post("desk#station", "load_station", params)

		params.npc = world.rooms.all["infirmary"].stations.aid
		if params.npc ~= "" then params.script = params.roomname .. "/" .. world.player.checkpoint:sub(1, -2) .. "aid" end 
		msg.post("/aid#npc_loader", "load_npc", params)

		params.npc = world.rooms.all["infirmary"].stations.loiter1
		if params.npc ~= "" then params.script = params.roomname .. "/" .. world.player.checkpoint:sub(1, -2) .. "loiter1" end 
		msg.post("/loiter1#npc_loader", "load_npc", params)

		params.npc = world.rooms.all["infirmary"].stations.loiter2
		if params.npc ~= "" then params.script = params.roomname .. "/" .. world.player.checkpoint:sub(1, -2) .. "loiter2" end 
		msg.post("/loiter2#npc_loader", "load_npc", params)

		 
		--script builder with quest checkpoint overwrites
		params.npc = world.rooms.all["infirmary"].stations.loiter4
		if params.npc ~= "" then 
			params.script = novel.script_builder(params.npc, params.roomname, "loiter4", nil, false)
			--params.script = params.roomname .. "/" .. world.player.checkpoint:sub(1, -2) .. "loiter4" 
		end 
		msg.post("/loiter4#npc_loader", "load_npc", params)
	end
end
**/
