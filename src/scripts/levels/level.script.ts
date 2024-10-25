import { Task } from '../../types/tasks'
import { address_cautions } from '../systems/tasksystem'
import { quest_checker } from '../quests/quests_main'

const dt = math.randomseed(os.time())
const { world } = globalThis.game
const { rooms, npcs, player, tasks, novel, quests } = world

//export function init() {
//place_npcs()
//}

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
      tasks.number_of_tasks('player')) *
    2

  cold +=
    Object.values(rooms.all.security.occupants!).filter((s) => s != '').length *
    3
  cold +=
    (player.hp +
      player.clearance +
      tasks.all.length +
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

function confrontation_scene(c: Task) {
  npcs.all[c.owner].convos = npcs.all[c.owner].convos + 1
  novel.npc = npcs.all[c.owner]

  //testjpf this is for player
  //is not using script builder
  novel.reason = c.owner
  novel.caution = { ...c }
  novel.priority = true
  msg.post('proxies:/controller#novelcontroller', 'show_scene')
}
function game_turn(room: string) {
  novel.priority = false
  novel.reason = 'none'
  novel.item = 'none'
  novel.reset_caution()
  //ai_turn() // abstract to world controller?
  print('game turn!!')
  rooms.unfocus_room()
  rooms.all[room].fsm.setState('focus')
  world.fsm.update(dt)
  //if i can incorporate confrontations
  //i can move the rest of this to various Turn fsm states
  //prob something like tasks.setState(progress)
  quests.update_quests_progress('turn')
  //tasks.setState()
  quest_checker('turn')
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
    this.roomname = message.roomname
    //TESTJPF can this whole conditional be moved to fsms???
    if (message.load_type == 'room transition') game_turn(message.roomname)
    calculate_heat(this.roomname)

    const confrontation: Task | null = address_cautions()
    msg.post(this.roomname + ':/level#' + this.roomname, 'room_load')
    //position player on screen
    msg.post('/shared/adam#adam', 'wake_up')
    if (confrontation != null) confrontation_scene(confrontation)
  } else if (messageId == hash('exit_gui')) {
    quests.update_quests_progress('interact')
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
