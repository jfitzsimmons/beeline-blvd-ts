import { ai_turn, place_npcs } from '../ai/ai_main'
const { world } = globalThis.game
const { rooms, npcs, player, tasks, novel } = world
import { Confront } from '../../types/state'
import { address_cautions } from '../systems/tasksystem'
import { quest_checker } from '../quests/quests_main'
export function init() {
  //place_npcs()
}
function game_turn(room: string) {
  rooms.clear_stations()
  ai_turn(room)
  quest_checker('turn')
  tasks.address_quests('turn', player.checkpoint)
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
  novel.npc = npcs.all[c.npc]
  novel.reason = c.reason
  msg.post('#', 'show_scene')
}
interface props {
  roomname: string
  storagename: string
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
        enter_room: tasks.spawn,
      }
      print('faint :level')
      msg.post('proxies:/controller#worldcontroller', 'faint', params)
    } else {
      this.roomname = message.roomname
      player.exitroom = rooms.layout[player.matrix_y][player.matrix_x]!
      player.currentroom = this.roomname
      player.matrix = rooms.all[this.roomname].matrix

      if (message.load_type == 'room transition') {
        game_turn(message.roomname)
      } else if (message.load_type == 'new game') {
        place_npcs()
      }

      update_hud()

      msg.post('level#' + this.roomname, 'room_load')

      const confrontation: Confront | null = address_cautions()
      if (confrontation != null) confrontation_scene(confrontation)

      //position player on screen
      msg.post('adam#adam', 'wake_up')
    }
  } else if (messageId == hash('exit_gui')) {
    quest_checker('interact')

    tasks.address_quests('interact', player.checkpoint)

    // if (message.novel == true) {
    //  msg.post(this.roomname + ':/adam#interact', 'reload_script')
    // }

    msg.post(this.roomname + ':/adam#adam', 'acquire_input_focus')
  } else if (messageId == hash('show_scene')) {
    msg.post('hud#map', 'release_input_focus')
    msg.post('proxies:/controller#novelcontroller', 'show_scene')
  } else if (messageId == hash('update_alert')) {
    sprite.play_flipbook(
      'hud#security_alert',
      'alert_' + tostring(player.alert_level)
    )
  }
}
