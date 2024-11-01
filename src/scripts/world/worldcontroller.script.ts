/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
// math.randomseed(os.time())
import { Game } from '../states/gamesystem2'
import { gamesave, gamesettings } from '../../types/legacylua'
import { url } from '../../types/utils'

globalThis.game = new Game()
const game = globalThis.game
const { world } = game
const { rooms, player } = world

interface props {
  is_level: boolean
  roomname: string
  storagename: string
  current_proxy: url | null
  load_type: string
}
//mpve transition to world state
//new game to game state
//then just set states testjpf
function handleTurnStates(load_type: string) {
  //testjpf what about adding faint and arrest
  if (load_type === 'room transition') {
    world.fsm.setState('turn')
  } else if (load_type === 'faint') {
    world.fsm.setState('faint')
  } else if (load_type === 'arrest') {
    world.fsm.setState('arrest')
  } else if (load_type === 'new game') {
    game.fsm.setState('new')
  }
}

function show(current_proxy: url | null, p: string) {
  if (current_proxy) {
    msg.post(current_proxy, 'unload')
    current_proxy = null
  }
  msg.post(p, 'async_load')
}

//init from bootstrap (main.collection)
export function init(this: props) {
  this.is_level = false
  this.current_proxy = null
  this.load_type = 'none'

  gamesave.init() // checks if theres app support data and if you're out of save slots
  gamesettings.init() // checks if menu settings file, creates new or reads
  msg.post('#', 'acquire_input_focus')
  msg.post('#', 'show_menu')
}

export function on_message(
  this: props,
  messageId: hash,
  message: {
    enter_room: string
    load_type: string
  },
  _sender: url
): void {
  //PICK_ROOM
  if (messageId == hash('pick_room')) {
    this.roomname = message.enter_room
    this.is_level = true
    this.load_type = message.load_type
    print('--- === ::: NEW ROOM LOADED ::: === ---')
    handleTurnStates(this.load_type)
    rooms.all[player.exitroom].fsm.setState('idle')
    rooms.all[this.roomname].fsm.setState('focus')

    show(this.current_proxy, '#' + this.roomname)
  }
  //PROXY_LOADED
  else if (messageId == hash('proxy_loaded')) {
    this.current_proxy = _sender
    if (this.is_level == true && this.current_proxy !== null) {
      const params = {
        roomname: this.roomname,
        load_type: this.load_type,
      }
      msg.post(this.roomname + ':/shared/scripts#level', 'room_load', params)
    }

    msg.post(_sender, 'enable')
  }
  //SHOW_MENU
  else if (messageId == hash('show_menu')) {
    this.is_level = false
    // should eventually change game state fsm // testjpf
    show(this.current_proxy, '#main_menu')
  }
  //TOGGLE_INFO
  else if (messageId == hash('toggle_info')) {
    this.is_level = false
    msg.post('proxies:/controller#infocontroller', 'toggle_info')
  }
}

export function on_input(
  this: props,
  action_id: hash,
  action: {
    released: boolean
  }
) {
  if (action_id == hash('main_menu') && action.released) {
    if (this.is_level == false) {
      //back to game without interruption or changing state.
      const params = {
        enter_room: this.roomname,
        load_type: 'return to game',
      }
      msg.post('#', 'pick_room', params)
    } else {
      msg.post('#', 'show_menu')
    }
  } else if (action_id == hash('info_gui') && action.released) {
    msg.post('#', 'toggle_info')
  } else if (action_id == hash('pinball') && action.released) {
    msg.post('proxies:/controller#pinballcontroller', 'show_pinball')
  }
}
