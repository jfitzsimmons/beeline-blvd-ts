//local world = require "main.states.worldstate"
//local novel = require "main.utils.novel"

const { rooms } = globalThis.game.world
function load_npcs() {
  const roomname = 'security' // testjpf remove hardcode string!

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

  const npc = rooms.fallbacks.stations.security_passer
  msg.post('/passer#npc_loader', 'load_npc', { npc })

  msg.post('prisoner1#npc_loader', 'load_npc', {
    npc: rooms.all['security'].prisoners!.prisoner1,
  })
  msg.post('prisoner2#npc_loader', 'load_npc', {
    npc: rooms.all['security'].prisoners!.prisoner2,
  })
  msg.post('prisoner3#npc_loader', 'load_npc', {
    npc: rooms.all['security'].prisoners!.prisoner3,
  })
  msg.post('prisoner4#npc_loader', 'load_npc', {
    npc: rooms.all['security'].prisoners!.prisoner4,
  })
}

export function on_message(messageId: hash, _sender: url): void {
  if (messageId == hash('room_load')) {
    load_npcs()
  }
}

/**local world = require "main.states.worldstate"

function on_message(self, message_id, message, sender)
	if message_id == hash("room_load") then
		local params = {
			roomname = "security", 
		}

		params.npc = world.rooms.all["security"].stations.authority
		if params.npc ~= "" then params.script = params.roomname .. "/" .. world.player.checkpoint:sub(1, -2) .. "authority" end -- .. world.npcs.all[params.npc].clan end -- .. world.npcs.all[message.npc].love--love_score or 5
		msg.post("authority#npc_loader", "load_npc", params)

		params.npc = world.rooms.all["security"].stations.guard
		if params.npc ~= "" then params.script = params.roomname .. "/" .. world.player.checkpoint:sub(1, -2) .. "guard" end -- .. world.npcs.all[params.npc].clan end -- .. world.npcs.all[message.npc].love--love_score or 5
		msg.post("guard#npc_loader", "load_npc", params)

		params.npc = world.rooms.all["security"].stations.assistant
		if params.npc ~= "" then params.script = params.roomname .. "/" .. world.player.checkpoint:sub(1, -2) .. "assistant" end -- .. world.npcs.all[params.npc].clan end -- .. world.npcs.all[message.npc].love--love_score or 5
		msg.post("assistant#npc_loader", "load_npc", params)

		params.npc = world.rooms.fallbacks.stations.security_passer
		if params.npc ~= "" then params.script = params.roomname .. "/" .. world.player.checkpoint:sub(1, -2) .. "passer" end 
		msg.post("/passer#npc_loader", "load_npc", params)

		params.npc = world.rooms.all["security"].prisoners.prisoner1
		if params.npc ~= "" then params.script = params.roomname .. "/" .. world.player.checkpoint:sub(1, -2) .. "prisoner" end -- .. world.npcs.all[params.npc].clan end -- .. world.npcs.all[message.npc].love--love_score or 5
		msg.post("prisoner1#npc_loader", "load_npc", params)

		params.npc = world.rooms.all["security"].prisoners.prisoner2
		if params.npc ~= "" then params.script = params.roomname .. "/" .. world.player.checkpoint:sub(1, -2) .. "prisoner" end -- .. world.npcs.all[params.npc].clan end -- .. world.npcs.all[message.npc].love--love_score or 5
		msg.post("prisoner2#npc_loader", "load_npc", params)
		
		params.npc = world.rooms.all["security"].prisoners.prisoner3
		if params.npc ~= "" then params.script = params.roomname .. "/" .. world.player.checkpoint:sub(1, -2) .. "prisoner" end -- .. world.npcs.all[params.npc].clan end -- .. world.npcs.all[message.npc].love--love_score or 5
		msg.post("prisoner3#npc_loader", "load_npc", params)
		
		params.npc = world.rooms.all["security"].prisoners.prisoner4
		if params.npc ~= "" then params.script = params.roomname .. "/" .. world.player.checkpoint:sub(1, -2) .. "prisoner" end -- .. world.npcs.all[params.npc].clan end -- .. world.npcs.all[message.npc].love--love_score or 5
		msg.post("prisoner4#npc_loader", "load_npc", params)
	end
end*/
