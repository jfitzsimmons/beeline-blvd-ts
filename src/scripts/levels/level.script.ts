import { quest_checker } from '../quests/quests_main'

const dt = math.randomseed(os.time())
const { world } = globalThis.game
const { rooms, npcs, player, tasks, novel, quests } = world

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
    if (npcs.all[npc].sincePlayerConvo <= 0) heat++
  }

  heat +=
    (player.alert_level +
      rooms.all[room].clearance * 5 +
      tasks.number_of_tasks('player')) *
    2

  cold +=
    Object.values(rooms.all.security.wards!).filter((s) => s != '').length * 3
  cold +=
    (player.hp +
      player.clearance +
      tasks.all.length +
      player.traits.skills.stealth +
      player.traits.skills.charisma) *
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
function game_turn() {
  novel.reset_novel()
  world.fsm.update(dt)
  print('????* *::: qQqQq: Quest Related AI checks: Running...')
  quest_checker('turn')
  print('????* *::: qQqQq: Quest Related AI checks: Finished.')
}
function quickLoad(_this: props) {
  msg.post(_this.roomName + ':/level#' + _this.roomName, 'room_load')
  msg.post('/shared/adam#adam', 'wake_up')
  print('111 --- === ::: NEW ROOM LOADED ::: === --- 111')
}

interface props {
  roomName: string
  storagename: string
}
export function on_message(
  this: props,
  messageId: hash,
  message: {
    roomName: string
    loadType: string
  },
  _sender: url
): void {
  if (messageId == hash('room_load')) {
    this.roomName = message.roomName
    if (message.loadType !== 'new game') game_turn()
    //testjpf it wopuld be cool to talk to npcs about their problem.
    //snitch, security issues etc.., effects
    // address_busy_tasks()
    // calculate_heat(this.roomName)
    quickLoad(this)
    if (novel.forced === true) {
      calculate_heat(this.roomName)
      msg.post('worldproxies:/controller#novelcontroller', 'show_scene')
      //  npcs.all[novel.npc.name].fsm.setState('turn')
      //  player.fsm.setState('turn')
    }
  } else if (messageId == hash('quick_load')) {
    quickLoad(this)
  } else if (messageId == hash('exit_gui')) {
    //quests.update_quests_progress('interact')
    quests.fsm.update(dt)
    quest_checker('interact')

    print('exitgui reason::', novel.reason)
    novel.reset_novel()
    //calculate_heat(this.roomName)
    msg.post('/shared/adam#adam', 'get_focus')
  } else if (messageId == hash('update_alert')) {
    sprite.play_flipbook(
      'hud#security_alert',
      'alert_' + tostring(player.alert_level)
    )
  }
  update_hud()
}
