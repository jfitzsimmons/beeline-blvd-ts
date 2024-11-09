import { address_busy_tasks } from '../systems/tasksystem'
import { quest_checker } from '../quests/quests_main'
import { aiActions } from '../ai/ai_main'

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
    if (npcs.all[npc].turns_since_convo <= 0) heat++
  }

  heat +=
    (player.alert_level +
      rooms.all[room].clearance * 5 +
      tasks.number_of_tasks('player')) *
    2

  cold +=
    Object.values(rooms.all.security.vacancies!).filter((s) => s != '').length *
    3
  cold +=
    (player.hp +
      player.clearance +
      tasks.all.length +
      player.state.traits.skills.stealth +
      player.state.traits.skills.charisma) *
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
/** 
function confrontation_scene() {
  npcs.all[c.owner].convos = npcs.all[c.owner].convos + 1
  novel.npc = npcs.all[c.owner]

  //testjpf this is for player
  //novel.reason is not the same thing as task.cause
  //novel may need better naming conventions

  // testjpf. not using this in noveltxts???
  //these are always player /address_cautions related.
  print('Con SCENE::: t owner/causereason::', c.owner, c.cause)
  novel.reason = c.owner
  novel.task = { ...c }
  novel.forced = true
  msg.post('proxies:/controller#novelcontroller', 'show_scene')
}
*/
function game_turn() {
  novel.forced = false
  novel.reason = 'none'
  novel.item = 'none'
  novel.reset_task()
  print('game turn!!')
  world.fsm.update(dt)
  aiActions()
  quest_checker('turn')
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
    novel: boolean
    npc_name: string
  },
  _sender: url
): void {
  if (messageId == hash('room_load')) {
    this.roomName = message.roomName
    //TESTJPF can this whole conditional be moved to fsms???
    if (message.loadType == 'room transition') game_turn()
    calculate_heat(this.roomName)
    address_busy_tasks()
    msg.post(this.roomName + ':/level#' + this.roomName, 'room_load')
    //position player on screen
    msg.post('/shared/adam#adam', 'wake_up')
    if (player.fsm.getState() === 'confronted') {
      msg.post('proxies:/controller#novelcontroller', 'show_scene')
      npcs.all[novel.npc.name].fsm.setState('turn')
      player.fsm.setState('turn')
    }
  } else if (messageId == hash('exit_gui')) {
    quests.update_quests_progress('interact')
    quest_checker('interact')

    print('exitgui reason::', novel.reason)
    novel.forced = false
    novel.reason = 'none'
    novel.item = 'none'
    novel.reset_task()
    //calculate_heat(this.roomName)
    msg.post(this.roomName + ':/shared/adam#adam', 'acquire_input_focus')
  } else if (messageId == hash('update_alert')) {
    sprite.play_flipbook(
      'hud#security_alert',
      'alert_' + tostring(player.alert_level)
    )
  }

  update_hud()
}
