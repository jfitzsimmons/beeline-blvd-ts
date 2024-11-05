import { Task } from '../../types/tasks'
import { address_cautions } from '../systems/tasksystem'
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
  //novel.reason is not the same thing as task.cause
  //novel may need better naming conventions

  // testjpf. not using this in noveltxts???
  //these are always player /address_cautions related.
  print('Con SCENE::: t owner/causereason::', c.owner, c.cause)
  novel.reason = c.owner
  novel.caution = { ...c }
  novel.forced = true
  msg.post('proxies:/controller#novelcontroller', 'show_scene')
}
function game_turn() {
  novel.forced = false
  novel.reason = 'none'
  novel.item = 'none'
  novel.reset_caution()
  print('game turn!!')
  //TESTJPF time has come for pre post turn! enter exit?!
  world.fsm.update(dt)
  //if i can incorporate confrontations
  //i can move the rest of this to various Turn fsm states
  //prob something like tasks.setState(progress)
  //quests.update_quests_progress('turn')
  //tasks.setState()
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
    //testjpf im guessing the issue is that address_Cautions
    //is already imported.
    //if i moved it to Tasks.fsm i bet it would be ok
    //and it would find new clearance caution form aiActions()
    const confrontation: Task | null = address_cautions()
    msg.post(this.roomName + ':/level#' + this.roomName, 'room_load')
    //position player on screen
    msg.post('/shared/adam#adam', 'wake_up')
    if (confrontation != null) confrontation_scene(confrontation)
  } else if (messageId == hash('exit_gui')) {
    quests.update_quests_progress('interact')
    quest_checker('interact')

    print('exitgui reason::', novel.reason)
    novel.forced = false
    novel.reason = 'none'
    novel.item = 'none'
    novel.reset_caution()
    //calculate_heat(this.roomName)

    // if (message.novel == true) {
    //msg.post(this.roomName + ':/adam#interact', 'reload_script')
    // }
    msg.post(this.roomName + ':/shared/adam#adam', 'acquire_input_focus')
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
