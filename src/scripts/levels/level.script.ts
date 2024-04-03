const { world } = globalThis.game
const { rooms, npcs, player, tasks, novel } = world
import { Confront } from '../../types/state'
import { address_cautions } from '../systems/tasksystem'
import { quest_checker } from '../quests/quests_main'
import { ai_turn, place_npcs } from '../ai/ai_main'

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
  calculate_heat(room)
}

function calculate_heat(room: string) {
  let heat = 0
  let cold = 0
  const stations = Object.values(rooms.all[room].stations).filter(
    (s) => s != ''
  )
  //let sKey: keyof typeof stations
  heat += stations.length
  print(heat, 'station length')
  for (const npc of stations) {
    heat += npcs.all[npc].love * -1
    if (npcs.all[npc].turns_since_convo <= 0) heat++
  }
  print(heat, 'love and convos')

  heat +=
    (player.alert_level +
      player.clearance +
      tasks.number_of_cautions('player')) *
    2
  print(heat, 'player security stuff')

  cold +=
    Object.values(rooms.all.security.occupants!).filter((s) => s != '').length *
    3
  print(cold, 'cold:: prisoner length')
  cold +=
    (player.hp +
      tasks.cautions.length +
      player.state.skills.stealth +
      player.state.skills.charisma) *
    2
  print(
    cold,
    'cold:: player skills /hp, caution.length',
    player.state.skills.charisma,
    player.state.skills.stealth
  )
  cold += player.ap
  print(cold, 'cold:: player ap')
  player.heat = heat / cold
  print(player.heat, '<:: Player HEAT!!!')
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
  msg.post('proxies:/controller#novelcontroller', 'show_scene')
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
        calculate_heat('grounds')
      }

      const confrontation: Confront | null = address_cautions()

      msg.post('level#' + this.roomname, 'room_load')
      //position player on screen
      msg.post('adam#adam', 'wake_up')
      if (confrontation != null) confrontation_scene(confrontation)
    }
  } else if (messageId == hash('exit_gui')) {
    quest_checker('interact')

    tasks.address_quests('interact', player.checkpoint)
    calculate_heat(this.roomname)

    // if (message.novel == true) {
    //  msg.post(this.roomname + ':/adam#interact', 'reload_script')
    // }
    msg.post(this.roomname + ':/adam#adam', 'acquire_input_focus')
    // } else if (messageId == hash('show_scene')) {
    //msg.post('hud#map', 'release_input_focus')
  } else if (messageId == hash('update_alert')) {
    sprite.play_flipbook(
      'hud#security_alert',
      'alert_' + tostring(player.alert_level)
    )
  }

  update_hud()
}
