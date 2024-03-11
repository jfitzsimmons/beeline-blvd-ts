/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
//const world = require( "main.states.worldstate")
//const ai = require('main.systems.ai.ai_main')
//const task = require('main.states.taskstates')
//const rooms = require( "main.states.roomstates")
//const tasksystem = require('../../main.systems.tasksystem')
const quest = require('../../main.systems.quests.quest_main')
const novel = require('../../main.utils.novel')
import { ai_turn } from '../ai/ai_main'
const { world } = globalThis.game
const { tasks, rooms, npcs, player } = world
import { Confront } from '../../types/state'
import { address_cautions } from '../systems/tasksystem'

function game_turn(room: string) {
  rooms.clear_stations()
  ai_turn(room)
  quest.address_quests('turn')
  player.ap = player.ap - 1
  player.turns = player.turns + 1
}

function update_hud() {
  label.set_text('hud#time', tostring(world.clock) + ':00')
  msg.post('hud#map', 'update_heat')
  //sprite.play_flipbook("/hud#security_alert", 'alert_' .. tostring(world.player.alert_level))
  //msg.post("hud#map", "acquire_input_focus")
}

function confrontation_scene(c: Confront) {
  npcs.all[c.npc].convos = npcs.all[c.npc].convos + 1
  const params = {
    path: novel.script_builder(c.npc, null, null, c.state, false),
    npc: c.npc,
    reason: c.reason,
  }
  //pass params to load novel
  msg.post('#', 'show_scene', params)
}
interface props {
  //chests: ???,
  //actions: actions
  roomname: string
  storagename: string
  //nlife: number
}
export function on_message(
  this: props,
  messageId: hash,
  message: {
    roomname: string
    load_type: string
    novel: boolean
    npc_name: string
  },
  _sender: url
): void {
  if (messageId == hash('room_load')) {
    if (player.ap <= 0) {
      const params = {
        enter_room: quest.checkpoints[player.checkpoint.slice(0, -1)].spawn,
      }
      msg.post('proxies:/controller#worldcontroller', 'faint', params)
    } else {
      this.roomname = message.roomname
      print(
        'player.matrix_y, player.matrix_x',
        player.matrix_y,
        player.matrix_x
      )
      player.exitroom = rooms.layout[player.matrix_y][player.matrix_x]!
      player.currentroom = this.roomname
      player.matrix = rooms.all[this.roomname].matrix

      if (
        message.load_type != 'load game' &&
        message.load_type != 'return to game' &&
        message.load_type != 'new game'
      ) {
        game_turn(message.roomname)
      }

      update_hud()

      //testjpf so could have load npcs, then load props
      //for rk,rv in pairs(world.rooms.all[this.room].npcs) do
      // desks use different scripts!!
      //props use specific animations per level!!
      //hold off for a while
      //load room specific state
      msg.post('level#' + this.roomname, 'room_load')

      const confrontation: Confront | null = address_cautions()
      if (confrontation != null) confrontation_scene(confrontation)

      //position player on screen
      msg.post('adam#adam', 'wake_up')
    }
  } else if (messageId == hash('exit_gui')) {
    quest.address_quests('interact')
    if (message.novel == true) {
      msg.post(this.roomname + ':/adam#interact', 'reload_script')
    }
    msg.post(this.roomname + ':/adam#adam', 'acquire_input_focus')
  } else if (messageId == hash('show_scene')) {
    msg.post('hud#map', 'release_input_focus')
    const params = message
    params.roomname = this.roomname
    msg.post('proxies:/controller#novelcontroller', 'show_scene', params)
  } else if (messageId == hash('update_alert')) {
    sprite.play_flipbook(
      'hud#security_alert',
      'alert_' + tostring(world.player.alert_level)
    )
    if (tasks.plan_on_snitching(message.npc_name, 'player') == false) {
      tasks.caution_builder(
        world.npcs.all[message.npc_name],
        'snitch',
        'player',
        'harassing'
      )
    }
  }
}
