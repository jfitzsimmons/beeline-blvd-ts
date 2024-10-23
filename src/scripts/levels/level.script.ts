import { Caution } from '../../types/tasks'
import { address_cautions } from '../systems/tasksystem'
import { quest_checker } from '../quests/quests_main'
//import { ai_turn } from '../ai/ai_main'
import { inventory_init } from '../systems/inventorysystem'
const dt = math.randomseed(os.time())

const { world } = globalThis.game
const { rooms, npcs, player, tasks, novel } = world

export function init() {
  //place_npcs()
}
function game_turn(room: string) {
  novel.priority = false
  novel.reason = 'none'
  novel.item = 'none'
  novel.reset_caution()
  //ai_turn() // abstract to world controller?
  world.fsm.setState('room')
  world.fsm.update(dt)
  tasks.update_quests_progress('turn', player.checkpoint)
  quest_checker('turn')
  player.ap = player.ap - 1
  player.turns = player.turns + 1
  calculate_heat(room)
  rooms.all[room].fsm.setState('focus')
}

function calculate_heat(room: string) {
  let heat = 0
  let cold = 0
  const stations = Object.values(rooms.all[room].stations).filter(
    (s) => s != ''
  )
  //let sKey: keyof typeof stations
  heat += stations.length
  for (const npc of stations) {
    heat += npcs.all[npc].love * -1
    if (npcs.all[npc].turns_since_convo <= 0) heat++
  }

  heat +=
    (player.alert_level +
      rooms.all[room].clearance * 5 +
      tasks.number_of_cautions('player')) *
    2

  cold +=
    Object.values(rooms.all.security.occupants!).filter((s) => s != '').length *
    3
  cold +=
    (player.hp +
      player.clearance +
      tasks.cautions.length +
      player.state.skills.stealth +
      player.state.skills.charisma) *
    2

  cold += player.ap
  player.heat = heat / cold
}

function update_hud() {
  label.set_text('hud#time', tostring(world.clock) + ':00')
  msg.post('hud#map', 'update_heat')
  //sprite.play_flipbook("/hud#security_alert", 'alert_' .. tostring(world.player.alert_level))
  //msg.post("hud#map", "acquire_input_focus")
}

function confrontation_scene(c: Caution) {
  npcs.all[c.npc].convos = npcs.all[c.npc].convos + 1
  novel.npc = npcs.all[c.npc]

  //testjpf this is for player
  //is not using script builder
  novel.reason = c.reason
  novel.caution = { ...c }
  novel.priority = true
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
        //place_npcs()
        world.fsm.setState('new')
        inventory_init()
        calculate_heat('grounds')
        rooms.all.grounds.fsm.setState('focus')
      }

      const confrontation: Caution | null = address_cautions()
      //grounds:/shared/scripts#level
      msg.post(this.roomname + ':/level#' + this.roomname, 'room_load')
      //position player on screen
      msg.post('/shared/adam#adam', 'wake_up')
      if (confrontation != null) confrontation_scene(confrontation)
    }
  } else if (messageId == hash('exit_gui')) {
    tasks.update_quests_progress('interact', player.checkpoint)
    quest_checker('interact')

    print('exitgui reason::', novel.reason)
    novel.priority = false
    novel.reason = 'none'
    novel.item = 'none'
    novel.reset_caution()
    //calculate_heat(this.roomname)

    // if (message.novel == true) {
    //msg.post(this.roomname + ':/adam#interact', 'reload_script')
    // }
    msg.post(this.roomname + ':/shared/adam#adam', 'acquire_input_focus')
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
